import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ioRedisStore } from '@tirke/node-cache-manager-ioredis'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  private readonly logger = new Logger(CacheConfig.name)

  private readonly DEFAULT_CACHE_FIFTEEN_MINS = 900

  constructor(private readonly configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const redisHost = this.configService.get(Config.REDIS_DEFAULT_HOST)

    if (redisHost) {
      return {
        store: ioRedisStore({
          host: this.configService.get(Config.REDIS_DEFAULT_HOST),
          port: +this.configService.get(Config.REDIS_DEFAULT_PORT),
          ttl: this.DEFAULT_CACHE_FIFTEEN_MINS,
          password: this.configService.get(Config.REDIS_DEFAULT_PASS),
          db: this.configService.get(Config.REDIS_DEFAULT_DB),
          keyPrefix: 'cache:',
        }),
      }
    }

    this.logger.warn(Config.REDIS_DEFAULT_HOST + ' is empty')

    return {
      ttl: this.DEFAULT_CACHE_FIFTEEN_MINS,
    }
  }
}
