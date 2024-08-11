import { BadRequestException, Controller, Get, Headers, UnauthorizedException } from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { isUUID } from 'class-validator'
import MUUID from 'uuid-mongodb'
import { ApiKeyResponseModel } from './api-key.response.model'
import { ApiKeyService } from './api-key.service'

@Controller({ path: 'api-keys', version: '1' })
@ApiTags('ApiKeyV1')
export class ApiKeyV1Controller {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @ApiHeader({ name: 'x-api-key' })
  @ApiOkResponse({ type: ApiKeyResponseModel })
  async getApiKey(@Headers('x-api-key') apiKey: string): Promise<ApiKeyResponseModel> {
    if (!isUUID(apiKey)) throw new BadRequestException()
    const doc = await this.apiKeyService.findById(MUUID.from(apiKey))
    if (!doc) throw new UnauthorizedException()
    return ApiKeyResponseModel.fromModel(doc)
  }
}
