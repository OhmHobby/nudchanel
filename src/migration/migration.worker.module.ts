import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { DataMigrationProcessorService } from './data-migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'
@Module({
  imports: [
    TypegooseModule.forFeature([UploadBatchFileModel], MongoConnection.Photo),
    TypeOrmModule.forFeature([DataMigrationEntity]),
    BullModule.registerQueue({ name: BullQueueName.DataMigration }),
  ],
  controllers: [MigrationController],
  providers: [MigrationService, DataMigrationProcessorService],
})
export class MigrationWorkerModule {}
