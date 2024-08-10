import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { ApiKeyModel } from 'src/models/api-key.model'
import { MUUID } from 'uuid-mongodb'

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKeyModel)
    protected readonly apiKeyModel: ReturnModelType<typeof ApiKeyModel>,
  ) {}

  findById(id: MUUID) {
    return this.apiKeyModel.findById(id).exec()
  }
}
