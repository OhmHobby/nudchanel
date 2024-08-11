import { modelOptions, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { MUUID } from 'uuid-mongodb'

@modelOptions({ schemaOptions: { collection: 'profiles' } })
export class PhotoProfilePhotoModel {
  @prop({ type: Types.UUID, required: true })
  _id: MUUID

  @prop({ required: true })
  profile: Types.ObjectId

  @prop({ required: true })
  directory: string

  @prop({ required: true })
  filename: string

  @prop({ default: false })
  processed?: boolean

  @prop({ default: Date.now, select: false })
  created_at?: Date

  get id() {
    return this._id
  }
}
