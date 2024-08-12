import { RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { DiscordProfile } from '@nudchannel/protobuf/dist/discord_profile'
import { Queue } from 'bull'
import { AmqpService } from 'src/amqp/amqp.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitQueue } from 'src/enums/rabbit-queue.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'

@Injectable()
export class DiscordProcessorService {
  private readonly logger = new Logger(DiscordProcessorService.name)

  constructor(
    private readonly amqpService: AmqpService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue<string>,
  ) {}

  async triggerProfileSyncAll() {
    const delayFactorMs = 2000
    const discordIds = await this.profileService.findAllDiscordIds()
    await this.migrationQueue.addBulk(
      discordIds.map((discordId, i) => ({
        name: BullJobName.MigrateDiscordProfileSync,
        data: discordId,
        opts: { delay: delayFactorMs * i },
      })),
    )
    return discordIds
  }

  async triggerProfileSync(discordId: string) {
    const profile = await this.profileService.findByDiscordId(discordId)
    if (!profile) return this.logger.warn(`Could not find profile for discordId: "${discordId}"`)
    const nickname = await this.profileNameService.getNickNameWithFirstNameAndInitial(profile._id)
    if (!nickname) return this.logger.warn(`Could not create nickname for profileId: "${profile._id}"`)
    const promises = profile.discord_ids?.map((discordId, i) =>
      this.publishDiscordProfileUpdated(discordId, this.getNicknameWithSuffix(nickname, i)),
    )
    await Promise.all(promises ?? [])
    this.logger.log({ message: 'Profile sync triggered', profileId: profile._id, discordId, nickname })
  }

  getNicknameWithSuffix(nickname: string, index = 0) {
    return index > 0 ? `${nickname} ${index + 1}` : nickname
  }

  private publishDiscordProfileUpdated(discordId: string, nickname?: string) {
    const message = DiscordProfile.toBinary({ discordId, nickname })
    return this.amqpService.publish(RabbitExchange.AccountsEvent, RabbitRoutingKey.DiscordProfileUpdated, message)
  }

  @RabbitRPC({
    exchange: RabbitExchange.DiscordBot,
    routingKey: RabbitRoutingKey.RequestProfileSync,
    queue: RabbitQueue.DiscordProfileSync,
    allowNonJsonMessages: true,
  })
  async onTriggerSync(_, { content }: { content: Uint8Array }) {
    const message = DiscordProfile.fromBinary(content)
    await this.triggerProfileSync(message.discordId)
  }
}
