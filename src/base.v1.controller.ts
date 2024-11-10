import { Controller, Get, Header } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from './enums/config.enum'
@Controller({ path: 'baseurl', version: '1' })
export class BaseV1Controller {
  constructor(private readonly configService: ConfigService) {}

  @Get('/accounts')
  @Header('content-type', 'text/plain')
  getAccountsBaseUrl() {
    return this.configService.get(Config.HTTP_BASEURL_ACCOUNTS)
  }

  @Get('/photos')
  @Header('content-type', 'text/plain')
  getPhotosBaseUrl() {
    return this.configService.get(Config.HTTP_BASEURL_PHOTO)
  }
}
