import { ApiProperty } from '@nestjs/swagger'
import { ApiKeyModel } from 'src/models/api-key.model'

export class ApiKeyResponseModel {
  constructor(model?: Partial<ApiKeyResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  service: string

  static fromModel(model: ApiKeyModel) {
    return new ApiKeyResponseModel({
      id: model._id.toString(),
      service: model.service,
    })
  }
}
