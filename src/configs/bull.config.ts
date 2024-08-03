import { SharedBullConfigurationFactory } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueueOptions } from 'bull'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
  private readonly logger = new Logger(BullConfig.name)

  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): QueueOptions {
    return {
      redis: {
        host: this.configService.get(Config.REDIS_DEFAULT_HOST),
        port: +this.configService.get(Config.REDIS_DEFAULT_PORT),
        password: this.configService.get(Config.REDIS_DEFAULT_PASS) || undefined,
        db: +this.configService.get(Config.REDIS_DEFAULT_DB),
      },
    }
  }
}
