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
}

export const envs = new EnvironmentVariables();

export const appConfig = registerAs('appConfig', () => ({
  nodeEnv: process.env.NODE_ENV as NodeEnvironment,
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
}));

export const envNamespaces = [appConfig];

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
