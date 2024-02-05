import { Injectable } from '@nestjs/common'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from 'nest-winston'
import { Config } from 'src/enums/config.enum'
import * as winston from 'winston'
import * as config from 'config'

@Injectable()
export class WinstonConfig implements WinstonModuleOptionsFactory {
  createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      level: config.get<string>(Config.LOG_LEVEL),
      transports: [new winston.transports.Console()],
    }
  }
}
