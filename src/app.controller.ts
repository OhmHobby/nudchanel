import { Controller, Get, Header } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/ping')
  @Header('content-type', 'text/plain')
  getPing(): string {
    return 'pong'
  }
}
