import { Module } from '@nestjs/common'
import { AmqpModule } from 'src/amqp/amqp.module'
import { StorageModule } from 'src/storage/storage.module'
import { PhotoConsumerService } from './photo-consumer.service'
import { PhotoStreamController } from './stream/photo-stream.controller'
import { PhotoStreamService } from './stream/photo-stream.service'
import { PhotoMetadataService } from './processor/photo-metadata.service'
import { PhotoProcessorController } from './processor/photo-processor.controller'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { PhotoWatermarkService } from './processor/watermark.service'

@Module({
  imports: [AmqpModule, StorageModule],
  providers: [
    PhotoStreamService,
    PhotoProcessorService,
    PhotoWatermarkService,
    PhotoMetadataService,
    PhotoConsumerService,
  ],
  controllers: [PhotoStreamController, PhotoProcessorController],
})
export class PhotoWorkerModule {}
