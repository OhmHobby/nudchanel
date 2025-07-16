/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerModuleOptions, ThrottlerOptions, ThrottlerOptionsFactory } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const redisHost = this.configService.get(Config.REDIS_DEFAULT_HOST)
    const rateLimiterEnabled = this.configService.get(Config.RATE_LIMITER_ENABLED, false)

    if (!rateLimiterEnabled) {
      return {
        storage: undefined,
        throttlers: [],
      }
    }

    return {
      storage: redisHost
        ? new ThrottlerStorageRedisService({
            host: this.configService.get(Config.REDIS_DEFAULT_HOST),
            port: +this.configService.get(Config.REDIS_DEFAULT_PORT),
            password: this.configService.get(Config.REDIS_DEFAULT_PASS),
            db: +this.configService.get(Config.REDIS_DEFAULT_DB),
          })
        : undefined,
      throttlers: [this.configService.getOrThrow<ThrottlerOptions>(Config.RATE_LIMITER_DEFAULT)],
    }
  }
}
