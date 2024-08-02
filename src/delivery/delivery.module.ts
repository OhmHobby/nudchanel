import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GoogleModule } from 'src/google/google.module'
import { BullProcessorProviderHelper } from 'src/helpers/bull-processor-provider.helper'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { DeliveryV1Controller } from './delivery.v1.controller'
import { DiscordUpcomingEventService } from './discord-upcoming-event/discord-upcoming-event.service'
import { MailProcessorService } from './mail/processor.service'
import { MailProviderService } from './mail/provider.service'
import { MailTemplatingService } from './mail/templating.service'
import { EmailConfirmationDeliveryProcessorService } from './processor/email-confirmation.service'

@Module({
  imports: [
    TypegooseModule.forFeature([MailTemplateModel, MailSenderAddressModel], MongoConnection.Mailer),
    BullModule.registerQueue({ name: BullQueueName.Email, defaultJobOptions: { attempts: 3, backoff: 5000 } }),
    GoogleModule,
    AccountsModule,
  ],
  providers: [
    DiscordUpcomingEventService,
    MailTemplatingService,
    MailProviderService,
    MailProcessorService,
    EmailConfirmationDeliveryProcessorService,
  ].filter(BullProcessorProviderHelper.filterEnabled),
  controllers: [DeliveryV1Controller],
})
export class DeliveryModule {}
