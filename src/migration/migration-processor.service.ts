import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { Types } from 'mongoose'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
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
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    try {
      switch (job.name) {
        case BullJobName.MigrateData:
          return await this.migrateData(job)
      }
    } catch (err) {
      throw new Error(err)
    }
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
