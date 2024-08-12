import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from './enums/config.enum'
import otelSDK from './tracing'

@Injectable()
export class OTELLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(OTELLifecyclesService.name)

  constructor(private readonly configService: ConfigService) {}

  async onApplicationShutdown(signal?: string) {
    if (this.configService.get(Config.OTLP_ENABLED)) {
      try {
        this.logger.warn({ message: 'Shutting down SDK', signal })
        await otelSDK.shutdown()
        this.logger.log('SDK shut down successfully')
      } catch (err) {
        this.logger.error('Error shutting down SDK', err)
      }
    }
  }
}
