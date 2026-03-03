import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';

@Module({
  imports: [RabbitMQModule],
  providers: [RabbitMQConsumerService],
})
export class WorkerModule {}
