import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { DataSource } from 'typeorm';
import { RABBITMQ_CONNECTION } from '../rabbitmq/rabbitmq.module';
import { ORDERS_QUEUE, ORDERS_DLQ, ORDERS_EXCHANGE } from '../rabbitmq/rabbitmq-producer.service';
import { Order, OrderStatus } from '../orders/domain/entities/order.entity';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    @Inject(RABBITMQ_CONNECTION)
    private readonly connection: AmqpConnectionManager,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.channelWrapper = this.connection.createChannel({
      setup: async (channel) => {
        await channel.assertQueue(ORDERS_QUEUE, { durable: true });
        await channel.consume(ORDERS_QUEUE, async (msg) => {
          if (msg) {
            await this.handleMessage(msg);
          }
        }, { noAck: false });
      },
    });
  }

  private async handleMessage(msg: any) {
    const content = JSON.parse(msg.content.toString());
    const { messageId, orderId, attempt } = content;

    console.log(`[Worker] Received messageId: ${messageId}, orderId: ${orderId}, attempt: ${attempt}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const alreadyProcessed = await queryRunner.manager.query(
        'SELECT 1 FROM processed_messages WHERE message_id = $1',
        [messageId]
      );

      if (alreadyProcessed.length > 0) {
        console.log(`[Worker] Message ${messageId} already processed. Skipping.`);
        this.channelWrapper.ack(msg);
        await queryRunner.rollbackTransaction();
        return;
      }

      await queryRunner.manager.query(
        'INSERT INTO processed_messages (message_id, order_id, handler) VALUES ($1, $2, $3)',
        [messageId, orderId, 'orders.process']
      );

      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId } });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      order.status = OrderStatus.COMPLETED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      this.channelWrapper.ack(msg);
      console.log(`[Worker] Successfully processed order ${orderId}, messageId: ${messageId}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`[Worker] Error processing order ${orderId}: ${error.message}`);

      if (attempt < this.MAX_ATTEMPTS) {
        console.log(`[Worker] Retrying order ${orderId}, attempt ${attempt + 1}`);
        const nextMessage = {
          ...content,
          attempt: attempt + 1,
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));

        await this.channelWrapper.publish(ORDERS_EXCHANGE, 'order.process', nextMessage, {
          persistent: true,
          messageId: messageId,
        });
        this.channelWrapper.ack(msg);
      } else {
        console.log(`[Worker] Max attempts reached for order ${orderId}. Sending to DLQ.`);
        await this.channelWrapper.sendToQueue(ORDERS_DLQ, content, { persistent: true });
        this.channelWrapper.ack(msg);
      }
    } finally {
      await queryRunner.release();
    }
  }
}
