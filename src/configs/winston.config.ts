import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { context, trace } from '@opentelemetry/api'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from 'nest-winston'
import { ClsService } from 'nestjs-cls'
import { Config } from 'src/enums/config.enum'
import winston, { format } from 'winston'
import LokiTransport from 'winston-loki'

@Injectable()
export class WinstonConfig implements WinstonModuleOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

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
    const cls = this.cls
    return {
      level: this.configService.get<string>(Config.LOG_LEVEL),
      defaultMeta: {
        get correlationId() {
          return cls?.getId()
        },
        get traceId() {
          return trace.getSpan(context?.active())?.spanContext()?.traceId
        },
        get spanId() {
          return trace.getSpan(context?.active())?.spanContext()?.spanId
        },
      },
      transports: [new winston.transports.Console({}), ...this.lokiTransport],
    }
  }
}
