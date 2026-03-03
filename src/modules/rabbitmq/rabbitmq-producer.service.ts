import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { RABBITMQ_CONNECTION } from './rabbitmq.module';

export const ORDERS_EXCHANGE = 'orders.exchange';
export const ORDERS_ROUTING_KEY = 'order.process';
export const ORDERS_QUEUE = 'orders.process';
export const ORDERS_DLQ = 'orders.dlq';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;

  constructor(
    @Inject(RABBITMQ_CONNECTION)
    private readonly connection: AmqpConnectionManager,
  ) {}

  async onModuleInit() {
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel) => {
        await channel.assertExchange(ORDERS_EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(ORDERS_QUEUE, { durable: true });
        await channel.assertQueue(ORDERS_DLQ, { durable: true });
        await channel.bindQueue(ORDERS_QUEUE, ORDERS_EXCHANGE, ORDERS_ROUTING_KEY);
      },
    });
  }

  async publishOrder(orderId: string, messageId: string, attempt = 0) {
    const message = {
      messageId,
      orderId,
      createdAt: new Date().toISOString(),
      attempt,
      producer: 'orders-api',
      eventName: 'order.created',
    };

    console.log(`Publishing order to RabbitMQ: ${orderId}, messageId: ${messageId}, attempt: ${attempt}`);

    await this.channelWrapper.publish(ORDERS_EXCHANGE, ORDERS_ROUTING_KEY, message, {
      persistent: true,
      messageId: messageId,
    });
  }
}
