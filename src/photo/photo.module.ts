import { Module } from '@nestjs/common'
import { PhotoProcesserV1Service } from './photo-processer.v1.service'

@Module({
  providers: [PhotoProcesserV1Service],
  exports: [PhotoProcesserV1Service],
})
export class PhotoModule {}
