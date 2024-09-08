import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { MailProcessorService } from './mail/processor.service'
import { MailProviderService } from './mail/provider.service'
import { MailTemplatingService } from './mail/templating.service'
import { EmailConfirmationDeliveryProcessorService } from './processor/email-confirmation.service'

@Module({
  imports: [
    TypegooseModule.forFeature([MailTemplateModel, MailSenderAddressModel], MongoConnection.Mailer),
    BullModule.registerQueue({ name: BullQueueName.Email, defaultJobOptions: { attempts: 4, backoff: 5000 } }),
  ],
  providers: [
    MailTemplatingService,
    MailProviderService,
    MailProcessorService,
    EmailConfirmationDeliveryProcessorService,
  ],
  controllers: [],
})
export class DeliveryWorkerModule {}
