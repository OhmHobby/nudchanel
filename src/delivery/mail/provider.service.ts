import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import { Queue } from 'bullmq'
import Mail from 'nodemailer/lib/mailer'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullPriority } from 'src/enums/bull-priority.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'

@Injectable()
export class MailProviderService implements OnModuleDestroy {
  private readonly logger = new Logger(MailProviderService.name)

  private readonly defaultEmail: string

  constructor(
    @InjectModel(MailSenderAddressModel)
    private readonly senderModel: ReturnModelType<typeof MailSenderAddressModel>,
    @InjectQueue(BullQueueName.Email)
    private readonly emailQueue: Queue<Mail.Options>,
    private readonly configService: ConfigService,
  ) {
    this.defaultEmail = this.configService.get(Config.DELIVERY_SMTP_USERNAME)!
  }

  async prepareMailData(
    to: string[],
    modifiedTemplate: MailTemplateModel,
    icalEvent?: string,
    cc?: string[],
  ): Promise<Mail.Options> {
    const sender = await this.senderModel.findById(modifiedTemplate.sender).lean().exec()
    const fromName = sender?.name ?? 'NUD Channel'
    const baseMailOption: Mail.Options = {
      from: `"${fromName}" <${this.defaultEmail}>`,
      replyTo: sender?.email,
      to,
      cc,
      subject: modifiedTemplate.subject,
      html: modifiedTemplate.body,
      icalEvent,
    }
    return baseMailOption
  }

  async send(data: Mail.Options, priority?: BullPriority) {
    return await this.emailQueue.add(BullJobName.Email, data, { priority })
  }

  async onModuleDestroy() {
    await this.emailQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
