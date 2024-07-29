import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import sendgridMail from '@sendgrid/mail'
import { Types } from 'mongoose'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { Config } from 'src/enums/config.enum'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { MailSenderAddressService } from './address.service'
import { IMail } from './mail.interface'

@Injectable()
export class MailProviderService {
  private readonly logger = new Logger(MailProviderService.name)

  private readonly smtpTransporter: Mail

  private readonly defaultEmail: string

  private smtpLogPattern(data: Pick<IMail, 'cc' | 'subject' | 'from' | 'to'>) {
    if (data.cc) {
      return `SMTP [${data.from} ==> ${data.to.join(',')} (cc:${data.cc.join(',')})]: ${data.subject}`
    } else {
      return `SMTP [${data.from} ==> ${data.to.join(',')}]: ${data.subject}`
    }
  }

  private sendGridPattern(data: Pick<IMail, 'cc' | 'subject' | 'from' | 'to'>) {
    if (data.cc) {
      return `Sendgrid [${data.from} ==> ${data.to.join(',')} (cc:${data.cc.join(',')})]: ${data.subject}`
    } else {
      return `Sendgrid [${data.from} ==> ${data.to.join(',')}]: ${data.subject}`
    }
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly senderService: MailSenderAddressService,
  ) {
    const sendgridApiKey = configService.get(Config.DELIVERY_SENDGRID_API_KEY)
    if (sendgridApiKey) {
      sendgridMail.setApiKey(sendgridApiKey)
    }
    this.smtpTransporter = createTransport({
      host: configService.get(Config.DELIVERY_SMTP_HOST),
      port: +configService.get(Config.DELIVERY_SMTP_PORT),
      secure: configService.get<boolean>(Config.DELIVERY_SMTP_SECURE),
      auth: {
        user: configService.get(Config.DELIVERY_SMTP_USERNAME),
        pass: configService.get(Config.DELIVERY_SMTP_PASSWORD),
      },
    })
    this.defaultEmail = this.configService.get(Config.DELIVERY_SMTP_USERNAME)!
  }

  async prepareMailData(
    to: string[],
    modifiedTemplate: MailTemplateModel,
    icalEvent?: string,
    cc?: string[],
  ): Promise<IMail> {
    const from = await this.senderService.getFromString(<Types.ObjectId>modifiedTemplate.sender)
    return {
      from: from ?? this.defaultEmail,
      to,
      cc,
      subject: modifiedTemplate.subject,
      html: modifiedTemplate.body,
      icalEvent,
    }
  }

  replaceNoReply(from: string, defaultEmail = this.defaultEmail) {
    return from.replace(/[\w\d.]+@\w+.\w+/, defaultEmail)
  }

  async send(data: IMail): Promise<boolean> {
    let sent = false
    const production = process.env.NODE_ENV === 'production'
    sent = await this.sendgrid(data, !production)
    if (!sent) {
      sent = await this.sendSmtp(data)
    }
    if (!sent) {
      this.logger.warn(`Unable to send "${data.subject}" to ${data.to.join(',')}`)
    }
    return sent
  }

  async sendSmtp({ from, to, cc, subject, html, icalEvent }: IMail): Promise<boolean> {
    const replaced = this.replaceNoReply(from)
    try {
      await this.smtpTransporter.sendMail({
        from: replaced,
        replyTo: from,
        to,
        subject,
        html,
        icalEvent,
        cc,
      })
      this.logger.log(this.smtpLogPattern({ from, to, cc, subject }))
      return true
    } catch (err) {
      this.logger.error(err)
      return false
    }
  }

  async sendgrid({ from, to, cc, subject, html, icalEvent }: IMail, sandbox = true): Promise<boolean> {
    const attachments: any[] = []
    if (icalEvent) {
      attachments.push({
        content: Buffer.from(icalEvent).toString('base64'),
        filename: 'invite.ics',
      })
    }
    try {
      await sendgridMail.send({
        from,
        to,
        cc,
        subject,
        html,
        attachments,
        mailSettings: {
          sandboxMode: {
            enable: sandbox,
          },
        },
      })
      this.logger.log(this.sendGridPattern({ from, to, subject, cc }))
      return !sandbox
    } catch (err) {
      this.logger.error(err)
      return false
    }
  }
}
