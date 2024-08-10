import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from './enums/config.enum'
import otelSDK from './tracing'

@Injectable()
export class OTELLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(OTELLifecyclesService.name)

  constructor(private readonly configService: ConfigService) {}

  async onApplicationShutdown() {
    if (this.configService.get(Config.OTLP_ENABLED)) {
      try {
        await otelSDK.shutdown()
        this.logger.log('SDK shut down successfully')
      } catch (err) {
        this.logger.error('Error shutting down SDK', err)
      }
    }
  }
}
