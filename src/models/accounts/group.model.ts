import { AutoIncrementID } from '@typegoose/auto-increment'
import { isDocumentArray, modelOptions, Plugins, Prop, Ref } from '@typegoose/typegoose'
import { UserGroupModel } from './user-group.model'

@modelOptions({ schemaOptions: { collection: 'groups' } })
@Plugins(AutoIncrementID, { startAt: 1 })
export class GroupModel {
  @Prop()
  _id?: number

  @Prop({ unique: true })
  name: string

  @Prop({ ref: () => UserGroupModel, localField: '_id', foreignField: 'group' })
  users?: Ref<UserGroupModel>[]

  get populatedUsers() {
    return isDocumentArray(this.users) ? this.users : undefined
  }
}
