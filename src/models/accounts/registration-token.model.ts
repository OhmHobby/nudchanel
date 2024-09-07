import { modelOptions, Prop, Severity } from '@typegoose/typegoose'
import { v4 as uuidv4 } from 'uuid'
import { ProfileModel } from './profile.model'

@modelOptions({
  schemaOptions: { collection: 'tokens.registration' },
  options: { allowMixed: Severity.ALLOW },
})
export class RegistrationTokenModel {
  @Prop({ default: uuidv4 })
  _id: string

  @Prop()
  profile: Partial<ProfileModel>

  @Prop({ type: Date, default: Date.now })
  expires_at: Date

  @Prop({ default: false })
  sign_in?: boolean
}
