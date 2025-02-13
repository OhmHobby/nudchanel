import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'
import { MigrationService } from './migration.service'

@Module({
  imports: [
    TypegooseModule.forFeature([ProfilePhotoModel]),
    TypeOrmModule.forFeature([DataMigrationEntity]),
    BullModule.registerQueue({ name: BullQueueName.Migration }),
  ],
  controllers: [MigrationController],
  providers: [MigrationService, MigrationProcessorService],
})
export class MigrationWorkerModule {}
