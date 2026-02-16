import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';
import { OrdersService } from '../../application/services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../../common/filters/http-exception.filter';
import { Order } from '../../domain/entities/order.entity';

@UseFilters(HttpExceptionFilter)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const order = await this.ordersService.createOrder(createOrderDto);

    if (
      order.idempotencyKey === createOrderDto.idempotencyKey &&
      order.createdAt.getTime() !== order.updatedAt.getTime()
    ) {
      res.status(HttpStatus.OK).json(order);
    } else {
      res.status(HttpStatus.CREATED).json(order);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order | null> {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }
}
