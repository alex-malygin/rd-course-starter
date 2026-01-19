import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const configService = app.get(ConfigService);
  const appConfigEnvs = configService.get('appConfig');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true}))
  await app.listen(appConfigEnvs.port);
}
bootstrap();
