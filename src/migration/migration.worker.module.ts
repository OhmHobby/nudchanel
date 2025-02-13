import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoWorkerModule } from 'src/photo/photo.worker.module'
import { StorageModule } from 'src/storage/storage.module'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'

@Module({
  imports: [
    TypegooseModule.forFeature([ProfilePhotoModel]),
    TypegooseModule.forFeature([UploadBatchFileModel], MongoConnection.Photo),
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
