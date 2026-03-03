import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, validateSync } from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Local = 'local',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(NodeEnvironment, { message: 'Invalid environment' })
  NODE_ENV: NodeEnvironment

  @IsNumber()
  @IsOptional()
  PORT: number

  @IsNotEmpty()
  POSTGRES_HOST = process.env.POSTGRES_HOST;

  @IsNotEmpty()
  POSTGRES_PORT = Number(process.env.POSTGRES_PORT);

  @IsNotEmpty()
  POSTGRES_DB = process.env.POSTGRES_DB;

  @IsNotEmpty()
  POSTGRES_USER = process.env.POSTGRES_USER;

  @IsNotEmpty()
  POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

  @IsNotEmpty()
  RABBITMQ_USER = process.env.RABBITMQ_USER;

  @IsNotEmpty()
  RABBITMQ_PASS = process.env.RABBITMQ_PASS;

  @IsNotEmpty()
  RABBITMQ_HOST = process.env.RABBITMQ_HOST;

  @IsNotEmpty()
  RABBITMQ_PORT = Number(process.env.RABBITMQ_PORT);
}

export const envs = new EnvironmentVariables();

export const appConfig = registerAs('appConfig', () => ({
  nodeEnv: process.env.NODE_ENV as NodeEnvironment,
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
}));

export const databaseConfig = registerAs('database', () => ({
  host: envs.POSTGRES_HOST,
  port: envs.POSTGRES_PORT,
  username: envs.POSTGRES_USER,
  password: envs.POSTGRES_PASSWORD,
  database: envs.POSTGRES_DB,
}));

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  user: envs.RABBITMQ_USER,
  pass: envs.RABBITMQ_PASS,
  host: envs.RABBITMQ_HOST,
  port: envs.RABBITMQ_PORT,
}));

export const envNamespaces = [appConfig, databaseConfig, rabbitmqConfig];

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
