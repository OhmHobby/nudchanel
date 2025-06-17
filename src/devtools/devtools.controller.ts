import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { DevtoolsService } from './devtools.service'
import { GenerateDevTokenDto } from './dto/generate-dev-token.dto'

@ApiTags('DevTools')
@Controller({
  path: 'devtools',
  version: '1',
})
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {}

  @Get('token')
  @ApiOkResponse()
  async generateDevToken(@Query() dto: GenerateDevTokenDto, @Res({ passthrough: true }) res: Response) {
    return await this.devtoolsService.generateDevToken(dto, res)
  }
}
