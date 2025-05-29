import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { DataMigrationProcessorService } from './data-migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'
@Module({
  imports: [
    TypegooseModule.forFeature([UploadTaskModel], MongoConnection.Photo),
    TypeOrmModule.forFeature([DataMigrationEntity]),
    BullModule.registerQueue({ name: BullQueueName.DataMigration }),
  ],
  controllers: [MigrationController],
  providers: [MigrationService, DataMigrationProcessorService],
})
export class MigrationWorkerModule {}
