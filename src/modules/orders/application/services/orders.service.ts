import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { Product } from '@products/domain/entities/product.entity';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from '../../interface/dto/create-order.dto';
import { Order, OrderStatus } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { RabbitMQProducerService } from '../../../rabbitmq/rabbitmq-producer.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly dataSource: DataSource,
    private readonly rabbitMQProducer: RabbitMQProducerService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, idempotencyKey, items } = createOrderDto;
    const existingOrder = await this.orderRepository.findByKey(idempotencyKey);

    if (existingOrder) {
      return existingOrder;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrder = new Order();
      Object.assign(newOrder, {
        userId,
        idempotencyKey,
        status: OrderStatus.PENDING,
        totalAmount: 0,
      });
      newOrder.items = [];
      let totalAmount = 0;

      for (const itemDto of items) {
        const product = await queryRunner.manager
          .getRepository(Product)
          .findOne({
            where: { id: itemDto.productId },
            lock: { mode: 'for_no_key_update' },
          });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${itemDto.productId} not found.`,
          );
        }

        if (product.stock < itemDto.quantity) {
          throw new ConflictException(
            `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`,
          );
        }

        const orderItem = new OrderItem();
        Object.assign(orderItem, {
          productId: product.id,
          quantity: itemDto.quantity,
          price: product.price,
        });
        newOrder.items.push(orderItem);
        totalAmount += product.price * itemDto.quantity;

        // Оновлення складу
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);
      }

      newOrder.totalAmount = totalAmount;
      const createdOrder = await queryRunner.manager.save(newOrder);
      await queryRunner.commitTransaction();

      const messageId = uuidv4();
      await this.rabbitMQProducer.publishOrder(createdOrder.id, messageId);

      return createdOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (
        error.code === '23505' &&
        (error.detail?.includes('idempotency_key') ||
          error.constraint?.includes('idempotency_key'))
      ) {
        const existingOrder =
          await this.orderRepository.findByKey(idempotencyKey);
        if (existingOrder) {
          return existingOrder;
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred during order creation.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }
}
