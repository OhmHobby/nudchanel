import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job, Queue } from 'bull'
import { join } from 'path'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullPriority } from 'src/enums/bull-priority.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { UploadTaskRuleWatermark } from 'src/photo/upload-rules/upload-task-rule-watermark'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
    private readonly profilePhotoService: ProfilePhotoService,
    private readonly discordProcessorService: DiscordProcessorService,
    private readonly storageService: StorageService,
    private readonly photoV1Service: PhotoV1Service,
    private readonly photoProcessor: PhotoProcessorService,
    private readonly photoMetadata: PhotoMetadataService,
  ) {}

  @Process(BullJobName.MigrateDiscordProfileSync)
  async discordProfileSync({ data: discordId }: Job<string>) {
    try {
      await this.discordProcessorService.triggerProfileSync(discordId)
      this.logger.log({ message: 'Succesfully triggered discord profile sync', discordId })
    } catch (err) {
      this.logger.error({ message: 'Failed to trigger discord profile sync', discordId }, err)
      throw err
    }
  }

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

  async triggerReprocessAll() {
    const photosCursor = this.batchFileModel
      .find({ deleted: false, state: UploadTaskBatchFileState.processed })
      .lean()
      .cursor()

    for await (const photo of photosCursor) {
      this.migrationQueue
        .add(BullJobName.MigratePhoto, photo.uuid, {
          attempts: 4,
          backoff: 5000,
          priority: BullPriority.Low,
          removeOnComplete: true,
          removeOnFail: false,
        })
        .then((job) => this.logger.debug(`Queued ${photo.uuid} for migration`, job))
    }
  }

  async triggerProcessAllProfilePhotos() {
    const profiles = await this.profileModel
      .find({ photo: { $ne: null } })
      .lean()
      .exec()
    const promises = profiles.map((profile) =>
      this.migrationQueue.add(BullJobName.MigrateProfilePhoto, profile._id.toString(), {
        attempts: 4,
        backoff: 5000,
        removeOnComplete: true,
        removeOnFail: false,
      }),
    )
    return await Promise.all(promises)
  }
}
