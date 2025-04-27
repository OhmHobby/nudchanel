import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { isDocument, ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { AlbumPhotoUploadRule } from 'src/gallery/photo/rules/album-photo-upload-rule'
import { HexDecConverter } from 'src/helpers/hex-dec-converter'
import { MD5 } from 'src/helpers/md5.helper'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { DataSource, InsertResult } from 'typeorm'

@Injectable()
@Processor(BullQueueName.DataMigration, { concurrency: 1 })
export class DataMigrationProcessorService extends WorkerHost {
  private readonly logger = new Logger(DataMigrationProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectModel(UploadBatchFileModel)
    private readonly photoFileModel: ReturnModelType<typeof UploadBatchFileModel>,
    @InjectModel(UploadTaskModel)
    private readonly uploadTaskModel: ReturnModelType<typeof UploadTaskModel>,
  ) {
    super()
  }

  process(job: Job): Promise<any> {
    try {
      if (job.name === DataMigration.GalleryPhoto) {
        return this.migrateGalleryPhoto()
      } else if (job.name === DataMigration.PhotoUploadTask) {
        return this.migratePhotoUploadTask()
      }
      throw new Error(`${job.name} not found`)
    } catch (err) {
      this.logger.error(err)
      throw new Error(err)
    }
  }

  private migrateGalleryPhoto() {
    const parseRejectReason = (message: string) => {
      if (/resolution/.test(message)) return GalleryPhotoRejectReason.resolution
      else if (/taken/.test(message)) return GalleryPhotoRejectReason.timestamp
      else if (/duplicate/.test(message)) return GalleryPhotoRejectReason.duplicated
      else return GalleryPhotoRejectReason.other
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.insert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.GalleryPhoto }))
      const albums = await manager.find(GalleryAlbumEntity, { select: { id: true }, withDeleted: true })
      const albumIds = new Set(albums.map((el) => el.id))

      const total = await this.photoFileModel.countDocuments().exec()
      const cursor = await this.photoFileModel
        .find()
        .populate({
          path: 'batch',
          populate: { path: 'task', select: ['_id', 'album'] },
          select: ['_id', 'creator', 'owner', 'task', 'deleted'],
        })
        .cursor()
      const insertPromises: Promise<InsertResult>[] = []
      let i = 0
      for await (const doc of cursor) {
        const entity = new GalleryPhotoEntity({
          id: doc.uuid!.toString(),
          directory: doc.directory,
          filename: doc.filename,
          md5: MD5.hexToUuid(doc.md5),
          width: doc.width,
          height: doc.height,
          orientation: doc.orientation,
          takenWhen: doc.taken_timestamp,
          takenBy: isDocument(doc.batch) ? ObjectIdUuidConverter.toUuid(doc.batch.owner) : null,
          color: doc.color ? HexDecConverter.hexToDec(doc.color) : null,
          validatedAt: doc.md5 ? doc._id.getTimestamp() : null,
          processedAt: doc.state === UploadTaskBatchFileState.processed ? doc._id.getTimestamp() : null,
          reviewedBy:
            doc.state === UploadTaskBatchFileState.processed && isDocument(doc.batch)
              ? ObjectIdUuidConverter.toUuid(doc.batch.creator)
              : null,
          rejectReason:
            doc.state === UploadTaskBatchFileState.rejected && doc.message ? parseRejectReason(doc.message) : null,
          rejectMessage: doc.state === UploadTaskBatchFileState.rejected ? doc.message : null,
          errorMessage: doc.state === UploadTaskBatchFileState.error ? doc.message : null,
          createdBy: isDocument(doc.batch)
            ? (ObjectIdUuidConverter.toUuid(doc.batch.creator) ?? DEFAULT_UUID)
            : DEFAULT_UUID,
          importId: isDocument(doc.batch)
            ? ObjectIdUuidConverter.toUuid(doc.batch._id)
            : ObjectIdUuidConverter.toUuid(doc.batch),
          albumId:
            isDocument(doc.batch) && isDocument(doc.batch.task) && albumIds.has(doc.batch.task.album)
              ? doc.batch.task.album
              : null,
          createdAt: doc._id.getTimestamp(),
          updatedAt: doc._id.getTimestamp(),
          deletedAt:
            doc.deleted ||
            doc.state === UploadTaskBatchFileState.aborted ||
            (isDocument(doc.batch) ? !doc.batch.task || doc.batch.deleted : !doc.batch)
              ? doc._id.getTimestamp()
              : undefined,
        })
        insertPromises.push(manager.insert(GalleryPhotoEntity, entity))
        this.logger.log({ message: `[${++i}/${total}] Inserting gallery photo ${entity.id}`, entity })
      }
      await Promise.all(insertPromises)
    })
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
