import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Queue } from 'bullmq'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullPriority } from 'src/enums/bull-priority.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { Repository } from 'typeorm'

@Injectable()
export class MigrationService implements OnModuleDestroy {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    @InjectRepository(DataMigrationEntity)
    private readonly dataMigrationRepository: Repository<DataMigrationEntity>,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
  ) {}

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

  async getDataMigrations() {
    const row = await this.dataMigrationRepository.find()
    return row.map((el) => el.id)
  }

  async triggerDataMigration(name: string) {
    return await this.migrationQueue.add(BullJobName.MigrateData, name)
  }

  async onModuleDestroy() {
    await this.migrationQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
