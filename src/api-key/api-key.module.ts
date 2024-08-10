import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { ApiKeyModel } from 'src/models/api-key.model'
import { ApiKeyService } from './api-key.service'
import { ApiKeyV1Controller } from './api-key.v1.controller'

@Module({
  imports: [TypegooseModule.forFeature([ApiKeyModel])],
  controllers: [ApiKeyV1Controller],
  providers: [ApiKeyService],
})
export class ApiKeyModule {}
