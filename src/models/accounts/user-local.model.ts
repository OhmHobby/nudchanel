import { AutoIncrementID } from '@typegoose/auto-increment'
import { modelOptions, Plugins, Prop, Ref } from '@typegoose/typegoose'
import { ProfileModel } from './profile.model'

@modelOptions({ schemaOptions: { collection: 'users.local' } })
@Plugins(AutoIncrementID, { startAt: 1 })
export class UserLocalModel {
  @Prop()
  _id?: number

  @Prop({ ref: ProfileModel, required: false })
  profile?: Ref<ProfileModel>

  @Prop({ required: true, index: true, unique: true })
  username: string

  @Prop({ select: false })
  password: string

  @Prop({ type: Date, default: Date.now, select: false })
  password_last_set?: Date

  @Prop({ default: false, select: false })
  disabled?: boolean
}
