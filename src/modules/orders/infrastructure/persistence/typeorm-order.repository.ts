import { QueryRunner, Repository } from 'typeorm';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findByKey(idempotencyKey: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { idempotencyKey },
      relations: ['items', 'items.product'],
    });
  }

  async save(order: Order, queryRunner?: QueryRunner): Promise<Order> {
    if (queryRunner) {
      return queryRunner.manager.save(order);
    }

    return this.orderRepository.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
  }
}
