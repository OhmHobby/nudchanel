import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { RedisCache } from '@tirke/node-cache-manager-ioredis'

@Injectable()
export class CacheLifeCyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(CacheLifeCyclesService.name)

  constructor(
    @Inject(CACHE_MANAGER)
    protected readonly cacheManager: RedisCache,
  ) {}

  async onApplicationShutdown(signal?: string) {
    const client = this.cacheManager.store?.client
    if (client) {
      this.logger.warn({ message: 'Closing redis cache connections', signal })
      await client.quit()
      this.logger.log('Successfully closed redis cache connection')
    }
  }
}
