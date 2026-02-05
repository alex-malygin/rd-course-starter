# Домашнє завдання №5: Транзакційність та Оптимізація SQL

## 1. Транзакційне створення замовлення

### Ідемпотентність (Double-submit safe)

- Реалізовано через використання `idempotencyKey` типу UUID.
- У базі даних на поле `idempotency_key` додано `UNIQUE` constraint.
- В `OrdersService.createOrder` першим кроком виконується перевірка наявності замовлення з таким ключем:
  ```typescript
  const existingOrder = await this.orderRepository.findByKey(idempotencyKey);
  if (existingOrder) return existingOrder;
  ```
- У контролері реалізовано логіку повернення статусів: `201 Created` для нового замовлення та `200 OK` для вже існуючого.

### Транзакція (QueryRunner)

- Всі операції виконуються в межах однієї транзакції через `TypeORM QueryRunner`.
- Транзакція охоплює:
  1. Блокування продуктів для перевірки залишків.
  2. Створення запису `Order`.
  3. Створення записів `OrderItem`.
  4. Оновлення `stock` у таблиці `Products`.
- Використано блок `try / catch / finally` для гарантованого виклику `rollback` при помилках та `release()` для повернення з'єднання в пул.

### Захист від oversell (Конкурентність)

- Обрано підхід **Pessimistic Locking**.
- Використовується режим блокування `FOR NO KEY UPDATE` при читанні продукту:
  ```typescript
  const product = await queryRunner.manager.getRepository(Product).findOne({
    where: { id: itemDto.productId },
    lock: { mode: 'for_no_key_update' },
  });
  ```
- **Вибір**: Pessimistic locking обрано тому, що він надійно запобігає конфліктам при високій конкурентності (коли багато користувачів купують один товар одночасно). Це простіше в реалізації, ніж Retry logic для Optimistic locking, і гарантує актуальність даних про залишки на момент списання.

### Обробка помилок

- **409 Conflict**: повертається, якщо недостатньо товару на складі. Це бізнес-помилка, яка вказує на стан ресурсу.
- **200 OK**: повертається, якщо замовлення з таким `idempotencyKey` вже існує.
- **500 Internal Server Error**: для всіх непередбачуваних помилок з автоматичним rollback транзакції.

## 2. SQL-оптимізація

### Обраний запит

Отримання списку замовлень конкретного користувача з фільтрацією та сортуванням за датою:

```sql
SELECT * FROM orders
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND status = 'COMPLETED'
ORDER BY created_at DESC;
```

### План виконання ДО оптимізації

```
Sort  (cost=79.83..82.33 rows=1000 width=80) (actual time=0.302..0.362 rows=1000 loops=1)
  Sort Key: created_at DESC
  Sort Method: quicksort  Memory: 126kB
  ->  Seq Scan on orders  (cost=0.00..30.00 rows=1000 width=80) (actual time=0.007..0.118 rows=1000 loops=1)
        Filter: ((user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid) AND (status = 'COMPLETED'))
```

**Проблема**: Повне сканування таблиці (`Seq Scan`) та додаткова фаза сортування в пам'яті.

### Оптимізація

Створено складений індекс:

```sql
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
```

### План виконання ПІСЛЯ оптимізації

```
Index Scan using idx_orders_user_created on orders  (cost=0.28..84.65 rows=1000 width=80) (actual time=0.040..0.286 rows=1000 loops=1)
  Index Cond: (user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
  Filter: (status = 'COMPLETED')
```

**Результат**:

- Повне сканування замінено на `Index Scan`.
- **Зникла фаза сортування**, оскільки індекс уже зберігає дані у потрібному порядку (`created_at DESC`).
- Planner обрав цей план, бо він мінімізує кількість зчитаних сторінок з диска та уникає дорогої операції `Sort`.
