import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { RabbitMQProducerService } from './rabbitmq-producer.service';

export const RABBITMQ_CONNECTION = 'RABBITMQ_CONNECTION';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RABBITMQ_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const user = configService.get<string>('rabbitmq.user');
        const pass = configService.get<string>('rabbitmq.pass');
        const host = configService.get<string>('rabbitmq.host');
        const port = configService.get<number>('rabbitmq.port');

        const connection = amqp.connect([`amqp://${user}:${pass}@${host}:${port}`]);
        
        connection.on('connect', () => console.log('Successfully connected to RabbitMQ'));
        connection.on('disconnect', (err) => console.error('Disconnected from RabbitMQ', err));
        
        return connection;
      },
      inject: [ConfigService],
    },
    RabbitMQProducerService,
  ],
  exports: [RABBITMQ_CONNECTION, RabbitMQProducerService],
})
export class RabbitMQModule {}
