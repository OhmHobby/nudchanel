import { index, modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { ProfileModel } from './profile.model'

export type ProfileNameLanguage = 'en' | 'th'

@modelOptions({ schemaOptions: { collection: 'profiles.names' } })
@index({ profile: 1, lang: 1 })
export class ProfileNameModel {
  @Prop({ ref: () => ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ type: String, lowercase: true, trim: true })
  lang: ProfileNameLanguage

  @Prop({ type: String })
  title?: string

  @Prop({ type: String, index: true })
  firstname?: string

  @Prop({ type: String, index: true })
  lastname?: string

  @Prop({ type: String, index: true })
  nickname?: string
}
