import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { GoogleWorkerModule } from 'src/google/google.worker.module'
import { DiscordBotService } from './discord-bot.service'
import { DiscordProcessorService } from './discord-processor.service'
import { DiscordController } from './discord.controller'
import { DiscordService } from './discord.service'
import { DiscortEventsNotifierService } from './events-notifier/discord-events-notifier.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: BullQueueName.Discord, defaultJobOptions: { attempts: 2 } }),
    AccountsWorkerModule,
    GoogleWorkerModule,
  ],
  controllers: [DiscordController],
  providers: [DiscordService, DiscordBotService, DiscordProcessorService, DiscortEventsNotifierService],
})
export class DiscordWorkerModule {}
