import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bull'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class SchedulerRegisterService {
  private readonly logger = new Logger(SchedulerRegisterService.name)

  constructor(
    @InjectQueue(BullQueueName.DiscordEventsNotifier)
    private readonly discordEventsNotifierQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  private async registerDiscordEventsNotifier() {
    const upcomingCron = this.configService.get<string>(Config.DELIVERY_UPCOMINGEVENTS_CRON)
    const startingCron = this.configService.get<string>(Config.DELIVERY_STARTINGEVENTS_CRON)
    if (upcomingCron) {
      await this.discordEventsNotifierQueue.add(BullJobName.DiscordUpcomingEvents, null, {
        repeat: { cron: upcomingCron },
      })
      this.logger.log(`Registered ${BullJobName.DiscordUpcomingEvents} ${upcomingCron}`)
    }
    if (startingCron) {
      await this.discordEventsNotifierQueue.add(BullJobName.DiscordStartingEvents, null, {
        repeat: { cron: startingCron },
      })
      this.logger.log(`Registered ${BullJobName.DiscordStartingEvents} ${startingCron}`)
    }
  }

  async register() {
    await this.unregister()
    await this.registerDiscordEventsNotifier()
  }

  async unregister() {
    await this.discordEventsNotifierQueue.clean(0, 'delayed')
  }
}
