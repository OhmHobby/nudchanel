import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { MUUID } from 'uuid-mongodb'
import { ProfileModel } from './accounts/profile.model'

@modelOptions({
  schemaOptions: { collection: 'profiles.photos' },
})
export class ProfilePhotoModel {
  @prop({ type: Types.UUID, required: true })
  _id: MUUID

  @prop({ ref: () => ProfileModel, required: true })
  profile: Ref<ProfileModel>

  @prop({ required: true })
  directory: string

  @prop({ required: true })
  filename: string

  @prop({ default: () => new Date(), select: false })
  created_at?: Date
}
