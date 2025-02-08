import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { SchedulerRegisterService } from './scheduler-register.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: BullQueueName.Discord,
      defaultJobOptions: { attempts: 11, backoff: 5000, removeOnComplete: true },
    }),
  ],
  providers: [SchedulerRegisterService],
})
export class SchedulerModule {}
