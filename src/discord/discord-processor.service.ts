import { RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DiscordProfile } from '@nudchannel/protobuf/dist/discord_profile'
import { Job } from 'bullmq'
import { Snowflake } from 'discord.js'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitQueue } from 'src/enums/rabbit-queue.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { DiscordBotService } from './discord-bot.service'
import { DiscordService } from './discord.service'
import { DiscortEventsNotifierService } from './events-notifier/discord-events-notifier.service'

@Injectable()
@Processor(BullQueueName.Discord)
export class DiscordProcessorService extends WorkerHost {
  private readonly logger = new Logger(DiscordProcessorService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly discordBotService: DiscordBotService,
    private readonly discordEventsNotifierService: DiscortEventsNotifierService,
  ) {
    super()
  }

  async discordProfileSync({ data: discordId }: Job<Snowflake>) {
    return await this.triggerProfileSync(discordId)
  }

  processUpcomingCronJob() {
    const hourLookAhead = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_LOOKAHEADHOURS)
    const range = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_RANGEHOURS)
    return this.discordEventsNotifierService.triggerUpcoming(hourLookAhead, range)
  }

  async process(job: Job<Snowflake>) {
    try {
      switch (job.name) {
        case BullJobName.DiscordProfileSync:
          return await this.discordProfileSync(job)
        case BullJobName.DiscordUpcomingEvents:
          return await this.processUpcomingCronJob()
        case BullJobName.DiscordStartingEvents:
          return await this.discordEventsNotifierService.triggerStaring()
        default:
          throw new Error(`Unknown job name ${job.name}`)
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  @RabbitRPC({
    exchange: RabbitExchange.DiscordBot,
    routingKey: RabbitRoutingKey.RequestProfileSync,
    queue: RabbitQueue.DiscordProfileSync,
    allowNonJsonMessages: true,
  })
  async onTriggerSync(_, { content }: { content: Uint8Array }) {
    const message = DiscordProfile.fromBinary(content)
    try {
      await this.triggerProfileSync(message.discordId)
    } catch (err) {}
  }

  private async triggerProfileSync(discordId: Snowflake) {
    const user = this.discordBotService.getUserById(discordId)
    if (!user) return
    try {
      await this.discordService.triggerProfileNameSync(discordId)
      await this.discordService.triggerProfileRoleSync(discordId)
      this.logger.log({ message: 'Succesfully triggered discord profile sync', discordId })
    } catch (err) {
      this.logger.error({ message: 'Failed to trigger discord profile sync', discordId }, err)
      throw err
    }
  }
}
