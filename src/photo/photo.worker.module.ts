import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { AmqpModule } from 'src/amqp/amqp.module'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { StorageModule } from 'src/storage/storage.module'
import { PhotoConsumerService } from './photo-consumer.service'
import { PhotoV1Service } from './photo-v1.service'
import { PhotoMetadataService } from './processor/photo-metadata.service'
import { PhotoProcessorController } from './processor/photo-processor.controller'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { PhotoWatermarkService } from './processor/watermark.service'
import { PhotoStreamController } from './stream/photo-stream.controller'
import { PhotoStreamService } from './stream/photo-stream.service'

@Module({
  imports: [
    TypegooseModule.forFeature([UploadTaskModel, UploadBatchJobModel, UploadBatchFileModel], MongoConnection.Photo),
    AmqpModule,
    StorageModule,
  ],
  providers: [
    PhotoStreamService,
    PhotoProcessorService,
    PhotoWatermarkService,
    PhotoMetadataService,
    PhotoConsumerService,
    PhotoV1Service,
  ],
  controllers: [PhotoStreamController, PhotoProcessorController],
  exports: [PhotoV1Service, PhotoProcessorService, PhotoMetadataService],
})
export class PhotoWorkerModule {}
