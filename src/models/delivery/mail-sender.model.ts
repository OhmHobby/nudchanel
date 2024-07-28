import { modelOptions, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'senders' } })
export class MailSenderAddressModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  name: string

  @prop({ required: true, unique: true })
  email: string
}
