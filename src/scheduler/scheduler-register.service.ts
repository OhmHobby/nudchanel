import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class SchedulerRegisterService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(SchedulerRegisterService.name)

  constructor(
    @InjectQueue(BullQueueName.Discord)
    private readonly discordQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.register()
  }

  private async registerDiscordEventsNotifier() {
    const upcomingCron = this.configService.get<string>(Config.DELIVERY_UPCOMINGEVENTS_CRON)
    const startingCron = this.configService.get<string>(Config.DELIVERY_STARTINGEVENTS_CRON)
    if (upcomingCron) {
      await this.discordQueue.add(BullJobName.DiscordUpcomingEvents, null, {
        repeat: { pattern: upcomingCron },
      })
      this.logger.log(`Registered ${BullJobName.DiscordUpcomingEvents} ${upcomingCron}`)
    }
    if (startingCron) {
      await this.discordQueue.add(BullJobName.DiscordStartingEvents, null, {
        repeat: { pattern: startingCron },
      })
      this.logger.log(`Registered ${BullJobName.DiscordStartingEvents} ${startingCron}`)
    }
  }

  async register() {
    await this.unregister()
    await this.registerDiscordEventsNotifier()
  }

  async unregister() {
    const jobs = await this.discordQueue.getJobSchedulers()
    await Promise.all(jobs.map((job) => this.discordQueue.removeJobScheduler(job.key!)))
  }

  async onModuleDestroy() {
    await this.discordQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
