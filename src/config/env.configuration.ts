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

export const envNamespaces = [appConfig, databaseConfig];

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
