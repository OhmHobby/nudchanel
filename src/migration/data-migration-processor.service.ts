import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { isDocument, ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { Types } from 'mongoose'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { HexDecConverter } from 'src/helpers/hex-dec-converter'
import { MD5 } from 'src/helpers/md5.helper'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { DataSource, InsertResult } from 'typeorm'

@Injectable()
@Processor(BullQueueName.DataMigration, { concurrency: 1 })
export class DataMigrationProcessorService extends WorkerHost {
  private readonly logger = new Logger(DataMigrationProcessorService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectModel(ProfilePhotoModel)
    private readonly profilePhotoModel: ReturnModelType<typeof ProfilePhotoModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly photoFileModel: ReturnModelType<typeof UploadBatchFileModel>,
  ) {
    super()
  }

  process(job: Job): Promise<any> {
    try {
      if (job.name === DataMigration.ProfilePhoto) {
        return this.migrateProfilePhoto()
      } else if (job.name === DataMigration.GalleryPhoto) {
        return this.migrateGalleryPhoto()
      }
      throw new Error(`${job.name} not found`)
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

  private migrateGalleryPhoto() {
    const parseRejectReason = (message: string) => {
      if (/resolution/.test(message)) return GalleryPhotoRejectReason.resolution
      else if (/taken/.test(message)) return GalleryPhotoRejectReason.timestamp
      else if (/duplicate/.test(message)) return GalleryPhotoRejectReason.duplicated
      else return GalleryPhotoRejectReason.other
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.insert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.GalleryPhoto }))
      const albums = await manager.find(GalleryAlbumEntity, { select: { id: true } })
      const albumIds = new Set(albums.map((el) => el.id))

      const total = await this.photoFileModel.countDocuments().exec()
      const cursor = await this.photoFileModel
        .find()
        .populate({ path: 'batch', populate: { path: 'task', select: ['_id', 'album'] }, select: ['_id', 'task'] })
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
          createdBy: isDocument(doc.batch) ? ObjectIdUuidConverter.toUuid(doc.batch.creator) : DEFAULT_UUID,
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
            (isDocument(doc.batch) ? !doc.batch.task : !doc.batch)
              ? doc._id.getTimestamp()
              : undefined,
        })
        insertPromises.push(manager.insert(GalleryPhotoEntity, entity))
        this.logger.log({ message: `[${++i}/${total}] Inserting gallery photo ${entity.id}`, entity })
      }
      await Promise.all(insertPromises)
    })
  }
}
