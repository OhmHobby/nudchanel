import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
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
import { PhotoWorkerModule } from 'src/photo/photo.worker.module'
import { StorageModule } from 'src/storage/storage.module'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'

@Module({
  imports: [
    TypegooseModule.forFeature([ProfileModel], MongoConnection.Accounts),
    TypegooseModule.forFeature([UploadBatchFileModel], MongoConnection.Photo),
    TypegooseModule.forFeature(
      [
        YearModel,
        RoleModel,
        ApplicantModel,
        FormCollectionModel,
        FormQuestionModel,
        FormAnswerModel,
        InterviewSlotModel,
        InterviewV2SlotModel,
        NoteModel,
      ],
      MongoConnection.Recruit,
    ),
    TypeOrmModule.forFeature([DataMigrationEntity]),
    BullModule.registerQueue({ name: BullQueueName.Migration }),
    AccountsWorkerModule,
    StorageModule,
    PhotoWorkerModule,
  ],
  controllers: [MigrationController],
  providers: [MigrationService, MigrationProcessorService],
})
export class MigrationWorkerModule {}
