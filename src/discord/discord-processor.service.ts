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

@Injectable()
@Processor(BullQueueName.Discord)
export class DiscordProcessorService {
  private readonly logger = new Logger(DiscordProcessorService.name)

  constructor(
    private readonly discordService: DiscordService,
    private readonly discordBotService: DiscordBotService,
  ) {}

  @Process(BullJobName.DiscordProfileSync)
  async discordProfileSync({ data: discordId }: Job<Snowflake>) {
    return await this.triggerProfileSync(discordId)
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
