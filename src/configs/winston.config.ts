import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from 'nest-winston'
import { Config } from 'src/enums/config.enum'
import winston, { format } from 'winston'
import LokiTransport from 'winston-loki'

@Injectable()
export class WinstonConfig implements WinstonModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private get lokiTransport() {
    const lokiUrl = this.configService.get(Config.LOG_LOKI_URL)
    if (lokiUrl) {
      return [
        new LokiTransport({
          host: lokiUrl,
          format: format.json(),
          labels: {
            app: 'webservice',
            project: 'nudchannel',
            service_name: process.env.npm_package_name,
            service_version: process.env.npm_package_version,
            deployment_environment: process.env.NODE_ENV,
            hostname: process.env.HOSTNAME,
          },
        }),
      ]
    } else {
      return []
    }
  }

  createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      level: this.configService.get<string>(Config.LOG_LEVEL),
      transports: [new winston.transports.Console(), ...this.lokiTransport],
    }
  }
}
