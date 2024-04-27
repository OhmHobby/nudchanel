import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { GoogleModule } from 'src/google/google.module'
import { DiscordUpcomingEventService } from './discord-upcoming-event/discord-upcoming-event.service'

@Module({
  imports: [GoogleModule, AccountsModule],
  providers: [DiscordUpcomingEventService],
})
export class DeliveryModule {}
