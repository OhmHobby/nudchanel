import { InjectModel } from '@m8a/nestjs-typegoose'
import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bull'
import { join } from 'path'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { ApplicantModel } from 'src/models/recruit/applicant.model'
import { FormAnswerModel } from 'src/models/recruit/form-answer.model'
import { FormCollectionModel } from 'src/models/recruit/form-collections.model'
import { FormQuestionModel } from 'src/models/recruit/form-questions.model'
import { InterviewSlotModel } from 'src/models/recruit/interview-slot.model'
import { InterviewV2SlotModel } from 'src/models/recruit/interview-v2-slot.model'
import { NoteModel } from 'src/models/recruit/note.model'
import { RoleModel } from 'src/models/recruit/role.model'
import { YearModel } from 'src/models/recruit/year.model'
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
    private readonly profilePhotoService: ProfilePhotoService,
    private readonly storageService: StorageService,
    private readonly photoV1Service: PhotoV1Service,
    private readonly photoProcessor: PhotoProcessorService,
    private readonly photoMetadata: PhotoMetadataService,
    @InjectModel(YearModel)
    private readonly yearModel: ReturnModelType<typeof YearModel>,
    @InjectModel(RoleModel)
    private readonly roleModel: ReturnModelType<typeof RoleModel>,
    @InjectModel(ApplicantModel)
    private readonly applicantModel: ReturnModelType<typeof ApplicantModel>,
    @InjectModel(FormCollectionModel)
    private readonly formCollectionModel: ReturnModelType<typeof FormCollectionModel>,
    @InjectModel(FormQuestionModel)
    private readonly formQuestionModel: ReturnModelType<typeof FormQuestionModel>,
    @InjectModel(FormAnswerModel)
    private readonly formAnswerModel: ReturnModelType<typeof FormAnswerModel>,
    @InjectModel(InterviewSlotModel)
    private readonly interviewSlotModel: ReturnModelType<typeof InterviewSlotModel>,
    @InjectModel(InterviewV2SlotModel)
    private readonly interviewV2SlotModel: ReturnModelType<typeof InterviewV2SlotModel>,
    @InjectModel(NoteModel)
    private readonly noteModel: ReturnModelType<typeof NoteModel>,
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
      if (name === DataMigration.RecruitApplicantProfileFix) {
        return this.fixMigrateRecruit()
      }
      throw new Error(`${name} not found`)
    } catch (err) {
      this.logger.error(err)
      throw new Error(err)
    }
  }

  private fixMigrateRecruit() {
    return this.dataSource.transaction(async (manager) => {
      const applicants = await manager.getRepository(RecruitApplicantEntity).find()
      const applicantModels = await this.applicantModel.find().exec()
      applicants.forEach((applicant) => {
        const model = applicantModels.find((el) => el._id.equals(ObjectIdUuidConverter.toObjectId(applicant.oid!)))
        if (!model) throw new Error(`Applicant model is not found for ${applicant.id} (${applicant.oid})`)
        applicant.profileId = ObjectIdUuidConverter.toUuid(model.profile)
      })
      await manager.save(applicants)
      this.logger.log(`Saved ${applicants.length} applicants`)
    })
  }
}
