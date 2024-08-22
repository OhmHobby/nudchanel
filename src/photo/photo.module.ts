import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { PhotoProcesserV1Service } from './photo-processer.v1.service'
import { PhotoV1Service } from './photo-v1.service'

@Module({
  imports: [
    TypegooseModule.forFeature([UploadTaskModel, UploadBatchJobModel, UploadBatchFileModel], MongoConnection.Photo),
  ],
  providers: [PhotoV1Service, PhotoProcesserV1Service],
  exports: [PhotoV1Service, PhotoProcesserV1Service],
})
export class PhotoModule {}
