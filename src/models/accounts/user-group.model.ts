import { isDocumentArray, modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { GroupModel } from './group.model'
import { ProfileModel } from './profile.model'
import { UserLocalModel } from './user-local.model'

@modelOptions({ schemaOptions: { collection: 'users.groups' } })
export class UserGroupModel {
  @Prop()
  name: string

  @Prop({ ref: () => ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ ref: () => GroupModel })
  group: number

  @Prop({ ref: () => UserLocalModel, localField: 'profile', foreignField: 'profile' })
  user?: Ref<UserLocalModel>[]

  get populatedUser() {
    return isDocumentArray(this.user) ? this.user?.at(0) : undefined
  }
}
