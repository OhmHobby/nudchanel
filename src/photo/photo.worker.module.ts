import { Module } from '@nestjs/common'
import { StorageModule } from 'src/storage/storage.module'
import { PhotoProcessorController } from './processor/photo-processor.controller'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { PhotoWatermarkService } from './processor/watermark.service'

@Module({
  imports: [StorageModule],
  providers: [PhotoProcessorService, PhotoWatermarkService],
  controllers: [PhotoProcessorController],
})
export class PhotoWorkerModule {}
