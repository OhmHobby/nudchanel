import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bull'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'

@Injectable()
@Processor(BullQueueName.Email)
export class MailProcessorService {
  private readonly logger = new Logger(MailProcessorService.name)

  private readonly smtpTransporter: Mail

  constructor(configService: ConfigService) {
    this.smtpTransporter = createTransport({
      host: configService.get(Config.DELIVERY_SMTP_HOST),
      port: +configService.get(Config.DELIVERY_SMTP_PORT),
      secure: configService.get<boolean>(Config.DELIVERY_SMTP_SECURE),
      auth: {
        user: configService.get(Config.DELIVERY_SMTP_USERNAME),
        pass: configService.get(Config.DELIVERY_SMTP_PASSWORD),
      },
    })
  }

  sendMail(mailOptions: Mail.Options) {
    return this.smtpTransporter.sendMail(mailOptions)
  }

  @Process(BullJobName.Email)
  async process({ data }: Job<Mail.Options>) {
    try {
      const info = await this.sendMail(data)
      this.logger.log({ message: 'Succesfully sent an email', from: data.from, to: data.to, subject: data.subject })
      this.logger.debug('Send mail info', info)
      return info
    } catch (err) {
      this.logger.error('Failed to send an email', err)
      throw err
    }
  }
}
