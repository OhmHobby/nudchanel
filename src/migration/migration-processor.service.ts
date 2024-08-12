import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(private readonly discordProcessorService: DiscordProcessorService) {}

  @Process(BullJobName.MigrateDiscordProfileSync)
  async discordProfileSync({ data: discordId }: Job<string>) {
    try {
      await this.discordProcessorService.triggerProfileSync(discordId)
      this.logger.log({ message: 'Succesfully triggered discord profile sync', discordId })
    } catch (err) {
      this.logger.error({ message: 'Failed to trigger discord profile sync', discordId }, err)
      throw err
    }
  }
}
