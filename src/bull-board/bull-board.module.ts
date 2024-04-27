import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullBoardController } from './bull-board.controller'
import { BullQueueLifecyclesService } from './bull-queue.life-cycles.service'

@Module({
  imports: [BullModule.registerQueue({ name: BullQueueName.Saiko })],
  controllers: [BullBoardController],
  providers: [BullQueueLifecyclesService],
})
export class BullBoardModule {}
