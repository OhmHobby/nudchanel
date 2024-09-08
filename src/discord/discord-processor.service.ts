import { RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { DiscordProfile } from '@nudchannel/protobuf/dist/discord_profile'
import { Job } from 'bull'
import { Snowflake } from 'discord.js'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitQueue } from 'src/enums/rabbit-queue.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { DiscordBotService } from './discord-bot.service'
import { DiscordService } from './discord.service'
import { ConfigService } from '@nestjs/config'
import { DiscortEventsNotifierService } from './events-notifier/discord-events-notifier.service'
import { Config } from 'src/enums/config.enum'

@Injectable()
@Processor(BullQueueName.Discord)
export class DiscordProcessorService {
  private readonly logger = new Logger(DiscordProcessorService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly discordBotService: DiscordBotService,
    private readonly discordEventsNotifierService: DiscortEventsNotifierService,
  ) {}

  @Process(BullJobName.DiscordProfileSync)
  async discordProfileSync({ data: discordId }: Job<Snowflake>) {
    return await this.triggerProfileSync(discordId)
  }

  @Process(BullJobName.DiscordUpcomingEvents)
  processUpcomingCronJob() {
    const hourLookAhead = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_LOOKAHEADHOURS)
    const range = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_RANGEHOURS)
    return this.discordEventsNotifierService.triggerUpcoming(hourLookAhead, range)
  }

  @Process(BullJobName.DiscordStartingEvents)
  processStartingCronJob() {
    return this.discordEventsNotifierService.triggerStaring()
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
