import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ApplicantModel } from './applicant.model'

@modelOptions({ schemaOptions: { collection: 'notes' } })
export class NoteModel {
  @prop({ auto: true })
  _id?: Types.ObjectId

  @prop({ required: true, ref: () => ApplicantModel })
  applicant: Ref<ApplicantModel>

  @prop({ required: true })
  note: string

  @prop({ default: false, required: true })
  onlyme?: boolean

  @prop({ default: false, required: true })
  deleted?: boolean

  @prop({ required: true })
  creator: Types.ObjectId
}
