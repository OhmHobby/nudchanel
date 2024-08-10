import { BadRequestException, Controller, Get, Headers, UnauthorizedException } from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import { isUUID } from 'class-validator'
import MUUID from 'uuid-mongodb'
import { ApiKeyService } from './api-key.service'

@Controller({ path: 'api-keys', version: '1' })
@ApiTags('ApiKeyV1')
export class ApiKeyV1Controller {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @ApiHeader({ name: 'x-api-key' })
  async getApiKey(@Headers('x-api-key') apiKey: string) {
    if (!isUUID(apiKey)) throw new BadRequestException()
    const doc = await this.apiKeyService.findById(MUUID.from(apiKey))
    if (!doc) throw new UnauthorizedException()
    return doc
  }
}
