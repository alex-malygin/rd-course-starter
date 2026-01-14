import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from './config/env.configuration';

@Injectable()
export class AppService {
  constructor(@Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>) {

  }
  getHello(): string {
    return `ENV: ${this.config.nodeEnv} VERSION: ${process.env.npm_package_version}`
  }
}
