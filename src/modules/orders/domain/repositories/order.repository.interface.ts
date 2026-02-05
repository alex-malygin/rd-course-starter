import { QueryRunner } from 'typeorm';
import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  findByKey(idempotencyKey: string): Promise<Order | null>;
  save(order: Order, queryRunner?: QueryRunner): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
