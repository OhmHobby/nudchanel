import { isDocumentArray, modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ProfileNameModel } from './profile.name.model'

@modelOptions({
  schemaOptions: {
    collection: 'profiles',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
export class ProfileModel {
  constructor(model?: Partial<ProfileModel>) {
    Object.assign(this, model)
  }

  @Prop({ auto: true })
  _id: Types.ObjectId

  @Prop({ required: false })
  photo?: string

  @Prop({ index: true, type: String, dim: 1, select: true, lowercase: true })
  emails?: string[]

  @Prop({ select: false, type: String, dim: 1 })
  tels?: string[]

  @Prop({ select: false, type: String, dim: 1 })
  google_ids?: string[]

  @Prop({ select: true, type: String, dim: 1 })
  discord_ids?: string[]

  @Prop({ select: false, type: String, dim: 1 })
  discord_invites?: string[]

  @Prop({ select: false, type: String, dim: 1 })
  line_ids?: string[]

  @Prop({ select: false })
  national_id?: string

  @Prop({ ref: () => ProfileNameModel, localField: '_id', foreignField: 'profile' })
  names?: Ref<ProfileNameModel>[]

  get populatedNames() {
    return isDocumentArray(this.names) ? this.names : undefined
  }
}
