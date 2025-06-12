import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { ProfileModel } from './profile.model'

@modelOptions({ schemaOptions: { collection: 'students.profiles' } })
export class StudentProfileModel {
  @Prop()
  _id: string

  @Prop({ ref: ProfileModel, required: false })
  profile?: Ref<ProfileModel>

  @Prop()
  photo?: string
}
