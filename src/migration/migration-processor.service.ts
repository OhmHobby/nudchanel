import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { Types } from 'mongoose'
import { join } from 'path'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { UploadTaskRuleWatermark } from 'src/photo/upload-rules/upload-task-rule-watermark'
import { StorageService } from 'src/storage/storage.service'
import { DataSource } from 'typeorm'

@Injectable()
@Processor(BullQueueName.Migration, { concurrency: 1 })
export class MigrationProcessorService extends WorkerHost {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectModel(ProfilePhotoModel)
    private readonly profilePhotoModel: ReturnModelType<typeof ProfilePhotoModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    private readonly storageService: StorageService,
    private readonly photoV1Service: PhotoV1Service,
    private readonly photoProcessor: PhotoProcessorService,
    private readonly photoMetadata: PhotoMetadataService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    try {
      switch (job.name) {
        case BullJobName.MigratePhoto:
          return await this.migratePhoto(job)
        case BullJobName.MigrateData:
          return await this.migrateData(job)
      }
    } catch (err) {
      throw new Error(err)
    }
  }

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

  migrateData({ data: name }: Job<DataMigration>) {
    try {
      if (name === DataMigration.ProfilePhoto) {
        return this.migrateProfilePhoto()
      }
      throw new Error(`${name} not found`)
    } catch (err) {
      this.logger.error(err)
      throw new Error(err)
    }
  }

  private migrateProfilePhoto() {
    return this.dataSource.transaction(async (manager) => {
      await manager.insert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.ProfilePhoto }))
      const docs = await this.profilePhotoModel.find().exec()
      const entities = docs.map(
        (doc) =>
          new ProfilePhotoEntity({
            id: doc._id.toString(),
            profileId: ObjectIdUuidConverter.toUuid(doc.profile as Types.ObjectId),
            directory: doc.directory,
            filename: doc.filename,
            createdAt: doc.created_at,
          }),
      )
      await manager.insert(ProfilePhotoEntity, entities)
    })
  }
}
