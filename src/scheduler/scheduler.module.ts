import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { SchedulerRegisterService } from './scheduler-register.service'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Module({
  imports: [BullModule.registerQueue({ name: BullQueueName.Saiko })],
  providers: [SchedulerRegisterService],
})
export class SchedulerModule {}
