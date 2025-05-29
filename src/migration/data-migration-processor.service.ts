import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { AlbumPhotoUploadRule } from 'src/gallery/photo/rules/album-photo-upload-rule'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { DataSource } from 'typeorm'

@Injectable()
@Processor(BullQueueName.DataMigration, { concurrency: 1 })
export class DataMigrationProcessorService extends WorkerHost {
  private readonly logger = new Logger(DataMigrationProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectModel(UploadTaskModel)
    private readonly uploadTaskModel: ReturnModelType<typeof UploadTaskModel>,
  ) {
    super()
  }

  process(job: Job): Promise<any> {
    try {
      if (job.name === DataMigration.PhotoUploadTask) {
        return this.migratePhotoUploadTask()
      }
      throw new Error(`${job.name} not found`)
    } catch (err) {
      this.logger.error(err)
      throw new Error(err)
    }
  }

  private migratePhotoUploadTask() {
    return this.dataSource.transaction(async (manager) => {
      const albumRepository = manager.getRepository(GalleryAlbumEntity)
      await manager.upsert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.PhotoUploadTask }), {
        conflictPaths: ['id'],
      })
      const tasks = await this.uploadTaskModel.find().exec()
      const promises = tasks.map(async (task) => {
        const album = await albumRepository.findOne({
          where: { id: task.album },
          withDeleted: true,
          select: {
            id: true,
            uploadDirectory: true,
            minimumResolutionMp: true,
            takenAfter: true,
            takenBefore: true,
            watermarkPreset: true,
            updatedAt: true,
          },
        })
        if (!album) return this.logger.warn({ message: `Task ${task.id} has no album ${task.album}`, task })
        const rule = AlbumPhotoUploadRule.fromPattern(task.rules)
        if (
          album.uploadDirectory ||
          album.minimumResolutionMp ||
          album.takenAfter ||
          album.takenBefore ||
          album.watermarkPreset
        )
          return this.logger.log(`Skipped album ${album.id}`)
        album.uploadDirectory = task.src_directory ?? null
        album.minimumResolutionMp = rule.minimumResoluionMp ?? null
        album.takenAfter = rule.takenAfterDate ?? null
        album.takenBefore = rule.takenBeforeDate ?? null
        album.watermarkPreset = rule.watermarkPreset ?? null
        this.logger.log({ message: `Update album ${album.id}`, album })
        return manager.save(album)
      })
      await Promise.all(promises)
    })
  }
}
