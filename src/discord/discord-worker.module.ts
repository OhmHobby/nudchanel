import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DiscordBotService } from './discord-bot.service'
import { DiscordProcessorService } from './discord-processor.service'
import { DiscordController } from './discord.controller'
import { DiscordService } from './discord.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueName.Discord, defaultJobOptions: { attempts: 2 } }),
    AccountsWorkerModule,
  ],
  controllers: [DiscordController],
  providers: [DiscordService, DiscordBotService, DiscordProcessorService],
})
export class DiscordWorkerModule {}
