import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { ProfileModel } from './profile.model'

@modelOptions({ schemaOptions: { collection: 'tokens.signin' } })
export class SignInTokenModel {
  @Prop()
  _id: string

  @Prop({ ref: ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ type: Date, default: Date.now })
  expires_at: Date
}
