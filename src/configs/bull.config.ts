import { SharedBullConfigurationFactory } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueueOptions } from 'bullmq'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): QueueOptions {
    return {
      connection: {
        host: this.configService.get(Config.REDIS_DEFAULT_HOST),
        port: +this.configService.get(Config.REDIS_DEFAULT_PORT),
        password: this.configService.get(Config.REDIS_DEFAULT_PASS) || undefined,
        db: +this.configService.get(Config.REDIS_DEFAULT_DB),
      },
      skipWaitingForReady: true,
    }
  }
}
