import { InjectQueue } from '@nestjs/bull'
import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Queue } from 'bull'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Injectable()
export class BullQueueLifecyclesService implements OnApplicationShutdown {
  constructor(
    @InjectQueue(BullQueueName.DiscordEventsNotifier)
    private readonly saikoQueue: Queue,
  ) {}

  async onApplicationShutdown() {
    await Promise.all([this.saikoQueue.close()])
  }
}
