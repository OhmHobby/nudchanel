import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Queue } from 'bull'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Injectable()
export class BullQueueLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(BullQueueLifecyclesService.name)

  constructor(
    @InjectQueue(BullQueueName.DiscordEventsNotifier)
    private readonly saikoQueue: Queue,
    @InjectQueue(BullQueueName.Email)
    private readonly emailQueue: Queue,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
  ) {}

  async onApplicationShutdown(signal?: string) {
    try {
      this.logger.warn({ message: `Closing bullQueue connections`, signal })
      await Promise.all([this.saikoQueue.close(), this.emailQueue.close(), this.migrationQueue.close()])
      this.logger.log(`Successfully closed bullQueue connections`)
    } catch (err) {
      this.logger.error(`Error while closing bullQueue connections`, err)
    }
  }
}
