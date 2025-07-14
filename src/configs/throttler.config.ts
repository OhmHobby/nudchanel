/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { seconds, ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const redisHost = this.configService.get(Config.REDIS_DEFAULT_HOST)

    return {
      storage: redisHost
        ? new ThrottlerStorageRedisService({
            host: this.configService.get(Config.REDIS_DEFAULT_HOST),
            port: +this.configService.get(Config.REDIS_DEFAULT_PORT),
            password: this.configService.get(Config.REDIS_DEFAULT_PASS),
            db: +this.configService.get(Config.REDIS_DEFAULT_DB),
          })
        : undefined,
      throttlers: [
        {
          name: 'second',
          ttl: seconds(1),
          limit: 5,
        },
        {
          name: 'minute',
          ttl: seconds(60),
          limit: 90,
        },
      ],
    }
  }
}
