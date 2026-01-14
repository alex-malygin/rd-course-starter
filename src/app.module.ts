import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envNamespaces, validateEnv } from './config/env.configuration';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...envNamespaces],
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validate: validateEnv,
    }),

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
