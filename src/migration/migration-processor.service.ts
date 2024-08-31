import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job, Queue } from 'bull'
import { join } from 'path'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullPriority } from 'src/enums/bull-priority.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { UploadTaskRuleWatermark } from 'src/photo/upload-rules/upload-task-rule-watermark'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(
    private readonly discordProcessorService: DiscordProcessorService,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
    private readonly storageService: StorageService,
    private readonly photoV1Service: PhotoV1Service,
    private readonly photoProcessor: PhotoProcessorService,
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

  @Process(BullJobName.MigratePhoto)
  async migratePhoto({ data: uuid }: Job<string>) {
    const { file, batch, task } = await this.photoV1Service.getFileInfo(uuid)
    const originalPath = `webdav://${join(file.directory, file.filename)}`
    const isOriginalExist = await this.storageService.isExist(originalPath)
    const previewPath = new PhotoPath(PhotoSize.preview, uuid)
    const thumbnailPath = new PhotoPath(PhotoSize.thumbnail, uuid)
    if (isOriginalExist) {
      const buffer = await this.storageService.getBuffer(originalPath)
      const previewParams = previewPath.buildProcessParams({
        watermark: new UploadTaskRuleWatermark(task.rules).getValue() ?? undefined,
      })
      const previewBuffer = await this.photoProcessor.process(buffer, previewParams)
      await this.storageService.putFile(previewPath.sourcePath, previewBuffer)
      const thumbnailBuffer = await this.photoProcessor.process(previewBuffer, thumbnailPath.buildProcessParams())
      await this.storageService.putFile(thumbnailPath.sourcePath, thumbnailBuffer)
      this.logger.log(`Re-processed: ${originalPath}`)
    } else {
      this.logger.warn({ message: `${originalPath} is not found`, file, batch, task })
      const previewSource = `webdav://webdev/photos/preview/${uuid}.webp`
      const thumbnailSource = `webdav://webdev/photos/thumbnail/${uuid}.webp`
      const previewStream = await this.storageService.getStream(previewSource)
      this.logger.log(`Copied: ${previewSource}`)
      await this.storageService.putFile(previewPath.sourcePath, previewStream)
      const thumbnailStream = await this.storageService.getStream(thumbnailSource)
      await this.storageService.putFile(thumbnailPath.sourcePath, thumbnailStream)
      this.logger.log(`Copied: ${thumbnailSource}`)
    }
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
}
