import { Module } from '@nestjs/common'
import { StorageModule } from 'src/storage/storage.module'
import { PhotoConsumerService } from './photo-consumer.service'
import { PhotoProcessorController } from './processor/photo-processor.controller'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { PhotoWatermarkService } from './processor/watermark.service'

@Module({
  imports: [StorageModule],
  providers: [PhotoProcessorService, PhotoWatermarkService, PhotoConsumerService],
  controllers: [PhotoProcessorController],
})
export class PhotoWorkerModule {}
