import { RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { EmailConfirmation } from '@nudchannel/protobuf/dist/email_confirmation'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitQueue } from 'src/enums/rabbit-queue.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { MailProviderService } from '../mail/provider.service'
import { MailTemplatingService } from '../mail/templating.service'

@Injectable()
export class EmailConfirmationDeliveryProcessorService {
  private readonly logger = new Logger(EmailConfirmationDeliveryProcessorService.name)

  private readonly requestEmailConfirmationEvent = {
    name: 'request_email_confirmation',
    variables: [],
  }

  constructor(
    private readonly templateService: MailTemplatingService,
    private readonly mailService: MailProviderService,
  ) {}

  async sendEmailConfirmation(message: EmailConfirmation) {
    const template = await this.templateService.findByEventAndRenderBody(
      this.requestEmailConfirmationEvent.name,
      message,
    )
    if (!template) {
      return this.logger.error(`Template for ${this.requestEmailConfirmationEvent.name} not found`)
    }
    const mailData = await this.mailService.prepareMailData([message.email], template)
    await this.mailService.send(mailData)
  }

  @RabbitRPC({
    exchange: RabbitExchange.AccountsEvent,
    routingKey: RabbitRoutingKey.EmailConfirmationMessageCreated,
    queue: RabbitQueue.EmailConfirmationMessageCreated,
    allowNonJsonMessages: true,
  })
  async emailConfirmationMessageCreated(_: any, { content }: { content: Uint8Array }) {
    const message = EmailConfirmation.fromBinary(content)
    await this.sendEmailConfirmation(message)
  }
}
