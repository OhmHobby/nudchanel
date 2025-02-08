import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { RoleModel } from './role.model'
import { YearModel } from './year.model'

export enum OfferStatus {
  accepted = 'accepted',
  declined = 'declined',
  pending = 'pending',
}

export enum CompletionEnum {
  formRole = 'form_role',
  interviewTimeslot = 'interview_timeslot',
  register = 'register',
  interviewed = 'interviewed',
  survey = 'survey',
}

@modelOptions({ schemaOptions: { collection: 'applicants' } })
export class ApplicantModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  profile: Types.ObjectId

  @prop({ required: true, ref: () => YearModel })
  year: Ref<YearModel>

  @prop({ required: true, ref: () => RoleModel, default: () => [] })
  roles?: Ref<RoleModel>[]

  @prop({ ref: () => RoleModel, alias: 'offerRole' })
  offer_role?: Ref<RoleModel>

  offerRole?: Types.ObjectId

  @prop({ alias: 'offerDeadline' })
  offer_deadline?: Date

  offerDeadline?: Date

  @prop({
    enum: OfferStatus,
    default: OfferStatus.pending,
    alias: 'offerStatus',
  })
  offer_status?: OfferStatus

  offerStatus?: OfferStatus

  @prop({ default: () => [], enum: CompletionEnum, type: String, dim: 1 })
  completions?: CompletionEnum[]
}
