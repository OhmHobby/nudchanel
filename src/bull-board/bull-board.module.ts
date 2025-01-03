import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullBoardController } from './bull-board.controller'

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueName.Email }),
    BullModule.registerQueue({ name: BullQueueName.Discord }),
    BullModule.registerQueue({ name: BullQueueName.Migration }),
    BullModule.registerQueue({ name: BullQueueName.Photo }),
  ],
  controllers: [BullBoardController],
  providers: [],
})
export class BullBoardModule {}
