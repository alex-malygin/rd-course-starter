import { Module } from '@nestjs/common';
import { OrdersService } from './application/services/orders.service';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';
import { TypeOrmOrderRepository } from './infrastructure/persistence/typeorm-order.repository';
import { OrdersController } from './interface/controllers/orders.controller';
import { ProductsModule } from '@products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/entities/order.entity';
import { OrderItem } from './domain/entities/order-item.entity';
import { User } from '../users/domain/entities/user.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

const OrdersRepositoryProvider = {
  provide: ORDER_REPOSITORY,
  useClass: TypeOrmOrderRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User]),
    ProductsModule,
    RabbitMQModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepositoryProvider],
  exports: [OrdersService],
})
export class OrdersModule {}
