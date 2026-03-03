import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envNamespaces, validateEnv } from './config/env.configuration';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@users/users.module';
import { ProductsModule } from '@products/products.module';
import { OrdersModule } from '@orders/orders.module';
import { DatabaseModule } from './database/database.module';
import { WorkerModule } from './modules/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...envNamespaces],
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    WorkerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
