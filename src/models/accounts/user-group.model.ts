import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { GroupModel } from './group.model'
import { ProfileModel } from './profile.model'

@modelOptions({ schemaOptions: { collection: 'users.groups' } })
export class UserGroupModel {
  @Prop()
  name: string

  @Prop({ ref: () => ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ ref: () => GroupModel })
  group: number
}
