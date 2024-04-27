import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bull'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Injectable()
export class SchedulerRegisterService {
  private readonly logger = new Logger(SchedulerRegisterService.name)

  constructor(
    @InjectQueue(BullQueueName.Saiko)
    private readonly saikoQueue: Queue,
  ) {}

  private async registerSaiko() {
    await this.saikoQueue.add(BullJobName.Saiko, null, {
      repeat: { cron: '0 9,21 * * *' },
    })
    this.logger.log('Registered Saiko')
  }

  async register() {
    await this.unregister()
    await this.registerSaiko()
  }

  async unregister() {
    await this.saikoQueue.clean(0, 'delayed')
  }
}
