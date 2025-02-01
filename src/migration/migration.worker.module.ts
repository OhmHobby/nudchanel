import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { GoogleCredentialModel } from 'src/models/google-credential.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { PhotoWorkerModule } from 'src/photo/photo.worker.module'
import { StorageModule } from 'src/storage/storage.module'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'

@Module({
  imports: [
    TypegooseModule.forFeature([ProfileModel], MongoConnection.Accounts),
    TypegooseModule.forFeature([UploadBatchFileModel], MongoConnection.Photo),
    TypegooseModule.forFeature([GoogleCredentialModel], MongoConnection.Photo),
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
