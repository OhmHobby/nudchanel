import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ApplicantModel } from './applicant.model'
import { RoleModel } from './role.model'

@modelOptions({ schemaOptions: { collection: 'interview.v2.slots' } })
export class InterviewV2SlotModel {
  @prop({ auto: true })
  _id?: Types.ObjectId

  @prop({ required: true })
  start: Date

  @prop({ required: true })
  end: Date

  @prop({ required: true, ref: () => RoleModel })
  role: Ref<RoleModel>

  @prop({ required: false, ref: () => ApplicantModel })
  applicant?: Ref<ApplicantModel>
}
