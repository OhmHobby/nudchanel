import { InjectModel } from '@m8a/nestjs-typegoose'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bullmq'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { AlbumPhotoUploadRule } from 'src/gallery/photo/rules/album-photo-upload-rule'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { StudentInformationModel } from 'src/models/accounts/student-information.model'
import { StudentProfileModel } from 'src/models/accounts/student-profile.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
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
    @InjectModel(StudentInformationModel)
    private readonly studentInformationModel: ReturnModelType<typeof StudentInformationModel>,
    @InjectModel(StudentProfileModel)
    private readonly studentProfileModel: ReturnModelType<typeof StudentProfileModel>,
    @InjectModel(UserLocalModel)
    private readonly userLocalModel: ReturnModelType<typeof UserLocalModel>,
  ) {
    super()
  }

  process(job: Job): Promise<any> {
    try {
      if (job.name === DataMigration.PhotoUploadTask) {
        return this.migratePhotoUploadTask()
      } else if (job.name === DataMigration.NudStudent) {
        return this.migrateNudStudent()
      } else if (job.name === DataMigration.UserLocal) {
        return this.migrateUserLocal()
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

  private migrateNudStudent() {
    return this.dataSource.transaction(async (manager) => {
      const nudStudentRepository = manager.getRepository(NudStudentEntity)
      await manager.upsert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.NudStudent }), {
        conflictPaths: ['id'],
      })
      const studentProfiles = await this.studentProfileModel.find().exec()
      for (const studentDoc of studentProfiles) {
        if (!studentDoc.profile) continue
        const students = await this.studentInformationModel.find({ student_id: studentDoc._id.toString() }).exec()
        for (const student of students) {
          const studentEntity = new NudStudentEntity({
            studentId: studentDoc._id.toString(),
            profileId: ObjectIdUuidConverter.toUuid(studentDoc.profile.toString()),
            academicYear: student.year,
            classYear: student.level,
            className: student.room?.toString(),
            rank: student.number,
          })
          await nudStudentRepository.save(studentEntity)
          this.logger.log({ message: `Migrated student ${studentDoc._id}`, studentEntity })
        }
      }
    })
  }

  private migrateUserLocal() {
    return this.dataSource.transaction(async (manager) => {
      const userLocalUserRepository = manager.getRepository(UserLocalUserEntity)
      await manager.upsert(DataMigrationEntity, new DataMigrationEntity({ id: DataMigration.UserLocal }), {
        conflictPaths: ['id'],
      })
      const userLocals = await this.userLocalModel.find().exec()
      for (const userLocal of userLocals) {
        if (!userLocal.profile) {
          this.logger.warn({ message: `UserLocal ${userLocal._id} has no profile`, userLocal })
          continue
        }
        const userLocalEntity = new UserLocalUserEntity({
          profileId: ObjectIdUuidConverter.toUuid(userLocal.profile.toString()),
          username: userLocal.username,
          password: userLocal.password,
          passwordLastSet: userLocal.password_last_set,
          disabled: userLocal.disabled,
        })
        await userLocalUserRepository.save(userLocalEntity)
        this.logger.log({ message: `Migrated UserLocal ${userLocal._id}`, userLocalEntity })
      }
    })
  }
}
