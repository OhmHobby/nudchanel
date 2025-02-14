import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullBoardController } from './bull-board.controller'

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueName.Email }),
    BullModule.registerQueue({ name: BullQueueName.Discord }),
    BullModule.registerQueue({ name: BullQueueName.DataMigration }),
    BullModule.registerQueue({ name: BullQueueName.Photo }),
    BullModule.registerQueue({ name: BullQueueName.GalleryPhotoValidation }),
    BullModule.registerQueue({ name: BullQueueName.GalleryPhotoConversion }),
  ],
  controllers: [BullBoardController],
  providers: [],
})
export class BullBoardModule {}
