import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Job } from 'bullmq'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { StorageService } from 'src/storage/storage.service'
import { Repository } from 'typeorm'

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

@Injectable()
@Processor(BullQueueName.GalleryPhotoConversion, { concurrency: 1 })
export class GalleryPhotoConverterProcessorService extends WorkerHost {
  private readonly logger = new Logger(GalleryPhotoConverterProcessorService.name)

  constructor(
    @InjectRepository(GalleryPhotoEntity)
    private readonly galleryPhotoRepository: Repository<GalleryPhotoEntity>,
    private readonly storageService: StorageService,
    private readonly photoProcessorService: PhotoProcessorService,
  ) {
    super()
  }

  async process(job: Job<GalleryPhotoEntity>) {
    const photo = new GalleryPhotoEntity(job.data)
    try {
      const previewPath = new PhotoPath(PhotoSize.preview, photo.id)
      const thumbnailPath = new PhotoPath(PhotoSize.thumbnail, photo.id)
      const watermarkPreset = photo.album?.watermarkPreset ?? undefined
      if (!watermarkPreset) this.logger.warn(`Missing watermark for photo ${photo.id}`)
      const originalBuffer = await this.storageService.getBuffer(photo.fullpath)
      const previewBuffer = await this.photoProcessorService.process(
        originalBuffer,
        previewPath.buildProcessParams({ watermark: watermarkPreset }),
      )
      const uploadPreviewP = this.storageService.putFile(previewPath.sourcePath, previewBuffer)
      const thumbnailBuffer = await this.photoProcessorService.process(
        previewBuffer,
        thumbnailPath.buildProcessParams(), // Watermark from preview buffer
      )
      const uploadThumbnailP = this.storageService.putFile(thumbnailPath.sourcePath, thumbnailBuffer)
      await Promise.all([uploadPreviewP, uploadThumbnailP])
      await this.galleryPhotoRepository.update({ id: photo.id }, { processedAt: new Date() })
    } catch (err) {
      this.logger.error(`Error processing ${photo.id}: ${err.message}`, err)
      throw Error(`Error during conversion "${err.message}"`)
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<GalleryPhotoEntity>) {
    try {
      await this.galleryPhotoRepository.update(
        { id: job.data.id },
        { processedAt: new Date(), errorMessage: job.failedReason ?? InternalServerErrorException.name },
      )
    } catch (err) {
      this.logger.error(
        {
          message: `Failed to mark a job ${job?.data?.id} as "${job.failedReason}": ${err.message}`,
          data: job?.data,
        },
        err,
      )
    }
  }
}
