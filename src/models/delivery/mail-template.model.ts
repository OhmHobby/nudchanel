import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { MailSenderAddressModel } from './mail-sender.model'

@modelOptions({ schemaOptions: { collection: 'templates' } })
export class MailTemplateModel {
  @Prop({ auto: true })
  _id: Types.ObjectId

  @Prop({ ref: MailSenderAddressModel })
  sender: Ref<MailSenderAddressModel>

  @Prop({ required: false, unique: true, sparse: true })
  event?: string

  @Prop({ required: true })
  subject: string

  @Prop({ required: true })
  body: string

  @Prop({ default: false })
  deleted?: boolean
}
