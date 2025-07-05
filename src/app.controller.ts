import { Controller, Get, Header } from '@nestjs/common'
import { ApplicationSettingService } from './application-setting/application-setting.service'
import { SkipHttpLogging } from './helpers/skip-http-logging.decorator'

@Controller()
export class AppController {
  constructor(private readonly applicationSettingService: ApplicationSettingService) {}

  @Get('/ping')
  @Header('content-type', 'text/plain')
  @SkipHttpLogging()
  getPing(): string {
    return 'pong'
  }

  @Get('/version')
  @Header('content-type', 'text/plain')
  getVersion() {
    return process.env.npm_package_version
  }

  @Get('/migrate')
  async migrate() {
    await this.applicationSettingService.migrateSetting()
    return 'done'
  }
}
