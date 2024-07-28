import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GoogleModule } from 'src/google/google.module'
import { BullProcessorProviderHelper } from 'src/helpers/bull-processor-provider.helper'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { DiscordUpcomingEventService } from './discord-upcoming-event/discord-upcoming-event.service'
import { MailTemplatingService } from './mail/templating.service'

@Module({
  imports: [
    TypegooseModule.forFeature([MailTemplateModel, MailSenderAddressModel], MongoConnection.Mailer),
    GoogleModule,
    AccountsModule,
  ],
  providers: [DiscordUpcomingEventService, MailTemplatingService].filter(BullProcessorProviderHelper.filterEnabled),
})
export class DeliveryModule {}
