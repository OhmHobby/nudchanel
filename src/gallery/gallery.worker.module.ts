import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoWorkerModule } from 'src/photo/photo.worker.module'
import { StorageModule } from 'src/storage/storage.module'
import { GalleryPhotoConverterProcessorService } from './photo/gallery-photo-converter-processor.service'
import { GalleryPhotoValidatorProcessorService } from './photo/gallery-photo-validator-processor.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryAlbumEntity, GalleryPhotoEntity]),
    BullModule.registerQueue({
      name: BullQueueName.GalleryPhotoConversion,
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
        backoff: { type: 'exponential', delay: 5000 },
      },
    }),
    PhotoWorkerModule,
    StorageModule,
  ],
  providers: [GalleryPhotoValidatorProcessorService, GalleryPhotoConverterProcessorService],
})
export class GalleryWorkerModule {}
