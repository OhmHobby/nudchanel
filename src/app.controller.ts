import { Controller, Get, Header } from '@nestjs/common'
import { SkipHttpLogging } from './helpers/skip-http-logging.decorator'
import { ConfigService } from '@nestjs/config'
const BASEURL = 'http.baseUrl'

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

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

  @Get('/baseurl')
  @Header('content-type', 'text/plain')
  getBaseUrl() {
    return this.configService.get(BASEURL)
  }
}
