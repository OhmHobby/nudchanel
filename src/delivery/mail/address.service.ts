import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'

@Injectable()
export class MailSenderAddressService {
  constructor(
    @InjectModel(MailSenderAddressModel)
    private readonly senderModel: ReturnModelType<typeof MailSenderAddressModel>,
  ) {}

  async getFromString(senderId: Types.ObjectId | string): Promise<string | null> {
    const sender = await this.senderModel.findById(senderId).exec()
    if (!sender) {
      return null
    }
    return `"${sender.name}" <${sender.email}>`
  }
}
