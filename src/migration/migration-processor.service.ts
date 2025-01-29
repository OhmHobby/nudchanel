import { InjectModel } from '@m8a/nestjs-typegoose'
import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bull'
import { join } from 'path'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery-album.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { UploadTaskRuleWatermark } from 'src/photo/upload-rules/upload-task-rule-watermark'
import { StorageService } from 'src/storage/storage.service'
import { DataSource } from 'typeorm'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    @InjectModel(GalleryAlbumModel)
    private readonly galleryAlbumModel: ReturnModelType<typeof GalleryAlbumModel>,
    private readonly profilePhotoService: ProfilePhotoService,
    private readonly storageService: StorageService,
    private readonly photoV1Service: PhotoV1Service,
    private readonly photoProcessor: PhotoProcessorService,
    private readonly photoMetadata: PhotoMetadataService,
  ) {}

  @Process({ name: BullJobName.MigratePhoto, concurrency: 1 })
  async migratePhoto({ data: uuid }: Job<string>) {
    const { file, batch, task } = await this.photoV1Service.getFileInfo(uuid)
    const originalPath = `webdav://${join(file.directory, file.filename)}`
    const isOriginalExist = await this.storageService.isExist(originalPath)
    const previewPath = new PhotoPath(PhotoSize.preview, uuid)
    const isPreviewExist = await this.storageService.isExist(previewPath.sourcePath)
    const thumbnailPath = new PhotoPath(PhotoSize.thumbnail, uuid)
    let previewBuffer: Buffer
    if (isOriginalExist) {
      const originalBuffer = await this.storageService.getBuffer(originalPath)
      if (!!file.orientation && file.orientation !== Orientation.Rotated0) {
        const { width, height } = this.photoMetadata.getFileExif(originalBuffer)
        await this.batchFileModel.updateOne({ _id: file._id }, { width, height }).exec()
        this.logger.log(`Updated width/height ${width}x${height} [${file.orientation}]`)
      }
      if (isPreviewExist) {
        previewBuffer = await this.storageService.getBuffer(previewPath.sourcePath)
      } else {
        const previewParams = previewPath.buildProcessParams({
          watermark: new UploadTaskRuleWatermark(task.rules).getValue() ?? undefined,
        })
        previewBuffer = await this.photoProcessor.process(originalBuffer, previewParams)
        await this.storageService.putFile(previewPath.sourcePath, previewBuffer)
        this.logger.log(`Re-processed preview ${originalPath} => ${previewPath.sourcePath}`)
      }
    } else {
      this.logger.warn({ message: `${originalPath} is not found`, file, batch, task })
      const previewSource = `webdav://webdev/photos/preview/${uuid}.webp`
      previewBuffer = await this.storageService.getBuffer(previewSource)
      await this.storageService.putFile(previewPath.sourcePath, previewBuffer)
      this.logger.log(`Copied: ${previewSource}`)
    }
    const thumbnailBuffer = await this.photoProcessor.process(previewBuffer, thumbnailPath.buildProcessParams())
    await this.storageService.putFile(thumbnailPath.sourcePath, thumbnailBuffer)
    this.logger.log(`Re-processed thumbnail ${originalPath} => ${thumbnailPath.sourcePath}`)
  }

  @Process({ name: BullJobName.MigrateProfilePhoto, concurrency: 1 })
  async migrateProfilePhoto({ data: profileId }: Job<string>) {
    this.logger.debug(`Processing ${profileId}`)
    const profile = await this.profileModel.findById(profileId).exec()
    if (!profile?.photo) return this.logger.warn(`No photo for profileId ${profileId}`)
    const photo = await this.profilePhotoService.findByUuid(profile.photo)
    if (!photo) return this.logger.warn(`No photo ${profile.photo} for profileId ${profileId}`)
    await this.profilePhotoService.importFromNas(photo.directory, photo.filename, profile._id)
    this.logger.log(`Re-processed ${profileId}: ${photo.directory}/${photo.filename}`)
  }

  @Process({ name: BullJobName.MigrateData, concurrency: 0 })
  migrateData({ data: name }: Job<DataMigration>) {
    try {
      if (name === DataMigration.GalleryAlbum) {
        return this.migrateDataGalleryAlbum()
      }
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  private migrateDataGalleryAlbum() {
    return this.dataSource.transaction(async (manager) => {
      const albums = await this.galleryAlbumModel.find().exec()
      for (const album of albums) {
        this.logger.log(`Migrating gallery album id: ${album._id}`)
        const activityId = album.activity.toString()
        const activityCount = await manager.getRepository(GalleryActivityEntity).countBy({ id: activityId })
        const dummyActivity = new GalleryActivityEntity({
          id: activityId,
          title: `[Dummy] ${album.title}`,
          time: album.created_at,
          cover: album.cover,
          published: false,
          createdAt: album.created_at,
          updatedAt: album.updated_at,
          deletedAt: album.updated_at,
        })
        if (!activityCount) {
          await manager.save(dummyActivity)
        }
        await manager.save(
          new GalleryAlbumEntity({
            id: album._id.toString(),
            title: album.title,
            cover: album.cover || null,
            rank: album.rank,
            activityId: activityId,
            published: album.published,
            publishedAt: album.published ? album.published_at : null,
            createdAt: album.created_at,
            updatedAt: album.updated_at,
            deletedAt: album.deleted || !activityCount ? album.updated_at : undefined,
          }),
        )
      }
      await manager.save(new DataMigrationEntity({ id: DataMigration.GalleryAlbum }))
      this.logger.log(`Committing transactions`)
    })
  }
}
