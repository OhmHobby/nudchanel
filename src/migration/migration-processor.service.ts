import { InjectModel } from '@m8a/nestjs-typegoose'
import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { Ref, ReturnModelType } from '@typegoose/typegoose'
import { Job } from 'bull'
import { Types } from 'mongoose'
import { join } from 'path'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitFormAnswerEntity } from 'src/entities/recruit/recruit-form-answer.entity'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { ApplicantModel, CompletionEnum, OfferStatus } from 'src/models/recruit/applicant.model'
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
      if (name === DataMigration.Recruit) {
        return this.migrateRecruit()
      }
      throw new Error(`${name} not found`)
    } catch (err) {
      this.logger.error(err)
      throw new Error(err)
    }
  }

  private migrateRecruit() {
    const idFromOid = (items: { id: string; oid: string | null }[], oid: Ref<any>) =>
      items.find((el) => el.oid === ObjectIdUuidConverter.toUuid(oid as Types.ObjectId))?.id
    return this.dataSource.transaction(async (manager) => {
      await manager.save(new DataMigrationEntity({ id: DataMigration.Recruit }))
      // Recruit
      const recruitModels = await this.yearModel.find().exec()
      const recruits = recruitModels.map(
        (year) =>
          new RecruitSettingEntity({
            id: ObjectIdUuidConverter.toUuidV7(year._id),
            oid: ObjectIdUuidConverter.toUuid(year._id),
            year: year.year,
            name: year.name,
            openWhen: year.open,
            closeWhen: year.close,
            announceWhen: year.announce,
            maximumRole: year.maximum_role,
            updatedAt: year._id.getTimestamp(),
          }),
      )
      await manager.save(recruits)
      this.logger.log(`Saved ${recruits.length} recruits`)
      // Form collection
      const collectionModels = await this.formCollectionModel.find().exec()
      const collections = collectionModels.map(
        (collection) =>
          new RecruitFormCollectionEntity({
            id: ObjectIdUuidConverter.toUuidV7(collection._id),
            oid: ObjectIdUuidConverter.toUuid(collection._id),
            title: collection.title,
            recruitId: idFromOid(recruits, collection.year),
            updatedAt: collection._id.getTimestamp(),
          }),
      )
      await manager.save(collections)
      this.logger.log(`Saved ${collections.length} collections`)
      // Update survey
      recruits.forEach((recruit) => {
        const year = recruitModels.find((el) => el._id.equals(ObjectIdUuidConverter.toObjectId(recruit.oid!)))
        if ((year?.surveys?.length ?? 0) > 1) throw new Error(`${year?._id} has survey more than 1`)
        recruit.surveyCollectionId = idFromOid(collections, year?.surveys?.at(0)) || null
      })
      await manager.save(recruits)
      this.logger.log(`Saved ${recruits.length} recruits`)
      // Form question
      const questionModels = await this.formQuestionModel.find().exec()
      const questions = questionModels.map(
        (question) =>
          new RecruitFormQuestionEntity({
            id: ObjectIdUuidConverter.toUuidV7(question._id),
            oid: ObjectIdUuidConverter.toUuid(question._id),
            collectionId: idFromOid(collections, question.collection_id),
            question: question.question,
            input: question.input,
            options: question.options,
            rank: question.rank,
            updatedAt: question._id.getTimestamp(),
          }),
      )
      await manager.save(questions)
      this.logger.log(`Saved ${questions.length} questions`)
      // Role
      const roleModels = await this.roleModel.find().exec()
      const roles = roleModels.map(
        (role) =>
          new RecruitRoleEntity({
            id: ObjectIdUuidConverter.toUuidV7(role._id),
            oid: ObjectIdUuidConverter.toUuid(role._id),
            name: role.name,
            description: role.description,
            rank: role.rank,
            mandatory: role.mandatory,
            recruitId: idFromOid(recruits, role.year),
            collectionId: idFromOid(collections, role.collection_id),
            updatedAt: role._id.getTimestamp(),
          }),
      )
      await manager.save(roles)
      this.logger.log(`Saved ${roles.length} roles`)
      // General role
      const generalRoles = recruitModels.flatMap((recruit) =>
        recruit.collections?.map(
          (collection, index) =>
            new RecruitRoleEntity({
              id: ObjectIdUuidConverter.toUuidV7(recruit._id),
              name: collectionModels.find((el) => el._id.equals(collection as Types.ObjectId))?.title,
              description: '',
              rank: index,
              mandatory: true,
              recruitId: idFromOid(recruits, recruit._id),
              collectionId: idFromOid(collections, collection),
              updatedAt: recruit._id.getTimestamp(),
            }),
        ),
      )
      await manager.save(generalRoles)
      this.logger.log(`Saved ${generalRoles.length} generalRoles`)
      // Applicant
      const applicantModels = await this.applicantModel.find().exec()
      const applicants = applicantModels.map(
        (applicant) =>
          new RecruitApplicantEntity({
            id: ObjectIdUuidConverter.toUuidV7(applicant._id),
            oid: ObjectIdUuidConverter.toUuid(applicant._id),
            profileId: ObjectIdUuidConverter.toUuidV7(applicant.profile),
            recruitId: idFromOid(recruits, applicant.year),
            updatedAt: applicant._id.getTimestamp(),
          }),
      )
      await manager.save(applicants)
      this.logger.log(`Saved ${applicants.length} applicants`)
      // Applicant role
      const applicantRoles = applicantModels.flatMap((applicant) =>
        (applicant.roles ?? [])?.map(
          (role, index) =>
            new RecruitApplicantRoleEntity({
              id: ObjectIdUuidConverter.toUuidV7(applicant._id),
              rank: index,
              applicantId: idFromOid(applicants, applicant._id),
              roleId: idFromOid(roles, role._id),
              offerResponseAt:
                role._id.equals(applicant.offer_role as Types.ObjectId) &&
                applicant.offer_status !== OfferStatus.pending
                  ? applicant.offer_deadline
                  : null,
              offerAccepted:
                role._id.equals(applicant.offer_role as Types.ObjectId) &&
                applicant.offer_status === OfferStatus.accepted,
              offerExpireAt: applicant.offer_deadline,
              updatedAt: applicant.offer_deadline ?? applicant._id.getTimestamp(),
            }),
        ),
      )
      await manager.save(applicantRoles)
      this.logger.log(`Saved ${applicantRoles.length} applicantRoles`)
      // Answer
      const answerModels = await this.formAnswerModel.find().exec()
      const answers = answerModels.map(
        (answer) =>
          new RecruitFormAnswerEntity({
            id: ObjectIdUuidConverter.toUuidV7(answer._id),
            oid: ObjectIdUuidConverter.toUuid(answer._id),
            answer: answer.answer,
            applicantId: idFromOid(applicants, answer.applicant),
            questionId: idFromOid(questions, answer.question),
            updatedAt: answer._id.getTimestamp(),
          }),
      )
      await manager.save(answers)
      this.logger.log(`Saved ${answers.length} answers`)
      // Interview v1 slot
      const interviewV1SlotModels = await this.interviewSlotModel.find().exec()
      const interviewV1Slots = interviewV1SlotModels.flatMap((slot) =>
        slot.roles.map(
          (role) =>
            new RecruitInterviewSlotEntity({
              id: ObjectIdUuidConverter.toUuidV7(slot._id),
              oid: ObjectIdUuidConverter.toUuid(slot._id),
              startWhen: slot.start,
              endWhen: slot.end,
              interviewAt: applicantModels
                .find((el) => el._id.equals(slot.applicant as Types.ObjectId))
                ?.completions?.includes(CompletionEnum.interviewed)
                ? slot.end
                : null,
              roleId: idFromOid(roles, role._id),
              applicantId: idFromOid(applicants, slot.applicant),
              updatedAt: slot._id.getTimestamp(),
            }),
        ),
      )
      await manager.save(interviewV1Slots)
      this.logger.log(`Saved ${interviewV1Slots.length} interviewV1Slots`)
      // Interview v2 slot
      const interviewV2SlotModels = await this.interviewV2SlotModel.find().exec()
      const interviewV2Slots = interviewV2SlotModels.map(
        (slot) =>
          new RecruitInterviewSlotEntity({
            id: ObjectIdUuidConverter.toUuidV7(slot._id),
            oid: ObjectIdUuidConverter.toUuid(slot._id),
            startWhen: slot.start,
            endWhen: slot.end,
            interviewAt: applicantModels
              .find((el) => el._id.equals(slot.applicant as Types.ObjectId))
              ?.completions?.includes(CompletionEnum.interviewed)
              ? slot.end
              : null,
            roleId: idFromOid(roles, slot.role),
            applicantId: idFromOid(applicants, slot.applicant),
            updatedAt: slot._id.getTimestamp(),
          }),
      )
      await manager.save(interviewV2Slots)
      this.logger.log(`Saved ${interviewV2Slots.length} interviewV2Slots`)
      // Note
      const noteModels = await this.noteModel.find().exec()
      const notes = noteModels.map(
        (note) =>
          new RecruitNoteEntity({
            id: ObjectIdUuidConverter.toUuidV7(note._id),
            oid: ObjectIdUuidConverter.toUuid(note._id),
            note: note.creator ? note.note : `Unknown creator: ${note.note}`,
            onlyMe: note.onlyme || !note.creator,
            applicantId: idFromOid(applicants, note.applicant),
            createdBy: ObjectIdUuidConverter.toUuid(note.creator ?? '5b794c41fd533e3b2f61cf05'),
            updatedAt: note._id.getTimestamp(),
            deletedAt: note.deleted ? note._id.getTimestamp() : undefined,
          }),
      )
      console.log(notes.filter((el) => !el.createdBy))
      await manager.save(notes)
      this.logger.log(`Saved ${notes.length} notes`)
    })
  }
}
