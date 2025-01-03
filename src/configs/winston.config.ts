import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from 'nest-winston'
import { ClsService } from 'nestjs-cls'
import os from 'os'
import { join } from 'path'
import { AppRunMode } from 'src/enums/app-run-mode.enum'
import { Config } from 'src/enums/config.enum'
import winston, { format } from 'winston'
import LokiTransport from 'winston-loki'
import { File } from 'winston/lib/winston/transports'

@Injectable()
export class WinstonConfig implements WinstonModuleOptionsFactory {
  private readonly appName = 'webservice'

  private readonly runMode: AppRunMode

  private readonly hostname = process.env.HOSTNAME ?? os.hostname()

  constructor(
    protected readonly configService: ConfigService,
    protected readonly cls: ClsService,
  ) {
    this.runMode = this.configService.getOrThrow(Config.RUN_MODE)
  }

  private get lokiTransport() {
    const lokiUrl = this.configService.get(Config.LOG_LOKI_URL)
    if (lokiUrl) {
      return [
        new LokiTransport({
          host: lokiUrl,
          format: format.json(),
          labels: {
            app: this.appName,
            project: 'nudchannel',
            run_mode: this.runMode,
            service_name: process.env.npm_package_name,
            service_version: process.env.npm_package_version,
            deployment_environment: process.env.NODE_ENV,
            hostname: this.hostname,
            ci_job_id: process.env.CI_JOB_ID,
          },
        }),
      ]
    } else {
      return []
    }
  }

  private get fileTransport() {
    const directory = this.configService.get<string>(Config.LOG_DIR)
    if (directory) {
      const filename = join(directory, `${this.appName}-${this.runMode}-${this.hostname}.log`)
      return [
        new File({
          format: format.json(),
          filename,
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
      },
      transports: [new winston.transports.Console({}), ...this.fileTransport, ...this.lokiTransport],
    }
  }
}
