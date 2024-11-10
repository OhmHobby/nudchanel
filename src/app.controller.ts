import { Controller, Get, Header } from '@nestjs/common'
import { SkipHttpLogging } from './helpers/skip-http-logging.decorator'

@Controller()
export class AppController {
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
}
