# NestJS Dockerized Backend

Проєкт містить налаштування для розгортання NestJS додатку в Docker з оптимізацією образів, multi-stage збіркою та розділенням обов'язків.

## Структура проєкту

Проєкт побудований за принципами чистої архітектури (Clean Architecture):
- `src/modules` — модулі системи (Users, Products, Orders).
- `domain` — сутності та інтерфейси репозиторіїв.
- `application` — бізнес-логіка (сервіси).
- `infrastructure` — реалізація репозиторіїв (TypeORM).
- `interface` — контролери та DTO.

## Команди запуску

### 1. Розробка (Hot Reload)
Для запуску в режимі розробки з підтримкою hot reload та bind-mount коду:
```bash
docker compose -f compose.yml -f compose.dev.yml up --build
```
Додаток буде доступний на [http://localhost:3000](http://localhost:3000).

### 2. Production-like запуск
Запуск оптимізованого distroless образу:
```bash
docker compose up --build
```
Додаток буде доступний на [http://localhost:8080](http://localhost:8080).

### 3. Міграції та Seed
Міграції та початкові дані запускаються як одноразові завдання (one-off jobs):

**Запуск міграцій:**
```bash
docker compose run --rm migrate
```

**Запуск сідів (після міграцій):**
```bash
docker compose run --rm seed
```

### 4. Візуалізація бази даних (pgAdmin)
Для зручного перегляду бази даних через браузер:
1. Відкрийте [http://localhost:5050](http://localhost:5050).
2. Увійдіть за допомогою:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`
3. Щоб додати сервер бази даних у pgAdmin:
   - **Host name/address**: `postgres` (ім'я сервісу в Docker)
   - **Port**: `5432`
   - **Username/Password**: з вашого `.env` (за замовчуванням `postgres`/`postgres`)

## Як тестувати (API Usage)

### Отримання інформації про продукт (перевірка stock)
**Запит:**
```bash
curl http://localhost:8080/products/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12
```

### Створення замовлення
**Запит (замініть `idempotency-key` на унікальний UUID):**
```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "userId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "items": [
      {
        "productId": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        "quantity": 2
      }
    ]
  }'
```
- **Успішно**: 201 Created.
- **Повторний запит (Ідемпотентність)**: 200 OK (повертає те саме замовлення без повторного списання stock).

## Докази оптимізації та безпеки

### Порівняння розмірів образів (Image Size)
Нижче наведено порівняння різних стадій збірки:
- `rd-api:dev` (630MB) — містить усі залежності, вихідний код, інструменти розробки.
- `rd-api:prod` (446MB) — тільки `dist` та production залежності на базі Alpine.
- `rd-api:prod-distroless` (429MB) — мінімальний runtime без shell та зайвих утиліт.

**Команда для перевірки:**
```bash
docker image ls | grep rd-api
```

### Перевірка Non-root
- У стандартному `prod` образі використовується `USER node` (uid 1000).
- У `prod-distroless` використовується `USER nonroot` (uid 65532).

**Перевірка для prod (Alpine):**
```bash
docker run --rm rd-api:prod id
```

## Особливості архітектури
- **Multi-stage Build**: Відокремлено збірку (`build`), встановлення залежностей (`deps`) та runtime.
- **Security**: Postgres знаходиться у приватній мережі `internal` і не доступний ззовні.
- **Distroless**: Використання `gcr.io/distroless/nodejs22-debian12` забезпечує мінімальну поверхню атаки.

## 📂 Структура проєкту

Проєкт організовано за модульним підходом NestJS, що інтегрований у шари чистої архітектури:

```text
src/
├── config/              # Конфігурація (змінні середовища)
├── common/              # Спільні утиліти, декоратори, фільтри
├── modules/             # Функціональні модулі
│   ├── users/           # Приклад модуля
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── interface/
│   │   └── users.module.ts
│   ├── orders/          # ...
│   └── products/        # ...
├── app.module.ts        # Кореневий модуль
└── main.ts              # Точка входу
```