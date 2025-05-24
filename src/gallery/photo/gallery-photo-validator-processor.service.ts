import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, InternalServerErrorException, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Job, Queue } from 'bullmq'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { MD5 } from 'src/helpers/md5.helper'
import { Exif } from 'src/photo/models/exif.model'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { StorageService } from 'src/storage/storage.service'
import { DataSource, In, IsNull, Repository } from 'typeorm'

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

@Injectable()
@Processor(BullQueueName.GalleryPhotoValidation, { concurrency: 1 })
export class GalleryPhotoValidatorProcessorService extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(GalleryPhotoValidatorProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GalleryPhotoEntity)
    private readonly galleryPhotoRepository: Repository<GalleryPhotoEntity>,
    @InjectRepository(GalleryAlbumEntity)
    private readonly albumRepository: Repository<GalleryAlbumEntity>,
    @InjectQueue(BullQueueName.GalleryPhotoConversion)
    private readonly galleryPhotoConversionQueue: Queue<GalleryPhotoEntity>,
    private readonly storageService: StorageService,
    private readonly photoMetadataService: PhotoMetadataService,
  ) {
    super()
  }

  async process(job: Job<GalleryPhotoEntity>) {
    const photo = new GalleryPhotoEntity(job.data)
    try {
      if (!photo.album?.id && photo.albumId) {
        this.logger.warn({
          message: `Photo ${photo.id} has no album info. Try fallback albumId ${photo.albumId}`,
          data: job.data,
        })
        const album = await this.albumRepository.findOneBy({ id: photo.albumId })
        photo.album = album ?? undefined
      }
      if (!photo.album?.id) throw new Error('Missing populated album info')
      const photoBuffer = await this.storageService.getBuffer(photo.fullpath)
      if (!photoBuffer.length) throw new Error('File has no content')
      const md5uuid = MD5.fromBuffer(photoBuffer).uuid
      const [exif, color] = await Promise.all([
        this.photoMetadataService.getFileExif(photoBuffer),
        this.photoMetadataService.getPhotoColor(photoBuffer),
      ])
      this.logger.warn(`${photo.id} (${photo.filename}) md5 has changed from ${photo.md5} to ${md5uuid}`)
      const result = await this.validate(photo, photo.album, md5uuid, exif, color)
      if (result) {
        await this.galleryPhotoConversionQueue.add(photo.id, photo)
      }
    } catch (err) {
      this.logger.error(`Error validating ${photo.id}: ${err.message}`, err)
      throw Error(`Error during validation "${err.message}"`)
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<GalleryPhotoEntity>) {
    try {
      await this.galleryPhotoRepository.update(
        { id: job.data.id },
        { validatedAt: new Date(), errorMessage: job.failedReason ?? InternalServerErrorException.name },
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

  async validate(
    photo: GalleryPhotoEntity,
    album: GalleryAlbumEntity,
    md5Uuid: string,
    exif: Exif,
    color: number,
  ): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(GalleryPhotoEntity)
      await repository.update(
        { id: photo.id },
        {
          md5: md5Uuid,
          width: exif.width,
          height: exif.height,
          orientation: exif.orientation || null,
          takenWhen: exif.date,
          color,
          validatedAt: new Date(),
        },
      )

      const isRejectByDuplicated = await this.rejectNonrecentDuplicatedFiles(repository, md5Uuid, photo.id)
      if (isRejectByDuplicated) {
        this.logger.log(`${photo.id} has duplicated ${md5Uuid}`)
        return false
      }

      const isValidResolution = await this.isValidResolution(exif, album)
      if (!isValidResolution) {
        await repository.update({ id: photo.id }, { rejectReason: GalleryPhotoRejectReason.resolution })
        this.logger.log(`${photo.id}`)
        return false
      }

      const isValidTimestamp = await this.isValidTimestamp(exif.date, album)
      if (!isValidTimestamp) {
        await repository.update({ id: photo.id }, { rejectReason: GalleryPhotoRejectReason.timestamp })
        this.logger.log(`${photo.id}`)
        return false
      }

      return true
    })
  }

  isValidResolution(exif: Exif, album: GalleryAlbumEntity): boolean {
    const MEGA_PIXEL = 1000000
    const minimumResolution = album.minimumResolutionMp ? album.minimumResolutionMp * MEGA_PIXEL : 1
    const photoResolution = exif.width * exif.height
    const isResolutionMetRequirement = photoResolution >= minimumResolution
    return isResolutionMetRequirement
  }

  isValidTimestamp(takenDate: Date, album: GalleryAlbumEntity): boolean {
    const takenDay = dayjs(takenDate)
    const isValidTakenAfter = album.takenAfter ? takenDay.isSameOrAfter(album.takenAfter) : true
    const isValidTakenBefore = album.takenBefore ? takenDay.isSameOrBefore(album.takenBefore) : true
    const isValidTakenRange = isValidTakenAfter && isValidTakenBefore
    return isValidTakenRange
  }

  async rejectNonrecentDuplicatedFiles(
    repository: Repository<GalleryPhotoEntity>,
    md5Uuid: string,
    photoId: string,
  ): Promise<boolean> {
    const rejectedFiles = await repository.find({
      select: { id: true },
      where: { md5: md5Uuid, rejectReason: IsNull(), errorMessage: IsNull() },
      order: { createdAt: 'DESC' },
      skip: 1,
    })
    const rejectedFileIds = rejectedFiles.map((el) => el.id)
    await repository.update({ id: In(rejectedFileIds) }, { rejectReason: GalleryPhotoRejectReason.duplicated })
    return rejectedFileIds.includes(photoId)
  }

  async onModuleDestroy() {
    await this.galleryPhotoConversionQueue.close()
  }
}
