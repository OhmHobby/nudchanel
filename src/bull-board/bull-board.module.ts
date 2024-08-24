import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullBoardController } from './bull-board.controller'
import { BullQueueLifecyclesService } from './bull-queue.life-cycles.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueName.DiscordEventsNotifier }),
    BullModule.registerQueue({ name: BullQueueName.Email }),
    BullModule.registerQueue({ name: BullQueueName.Migration }),
    BullModule.registerQueue({ name: BullQueueName.Photo }),
  ],
  controllers: [BullBoardController],
  providers: [BullQueueLifecyclesService],
})
export class BullBoardModule {}
