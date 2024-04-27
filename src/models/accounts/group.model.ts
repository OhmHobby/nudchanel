import { AutoIncrementID } from '@typegoose/auto-increment'
import { modelOptions, Plugins, Prop } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { collection: 'groups' } })
@Plugins(AutoIncrementID, { startAt: 1 })
export class GroupModel {
  @Prop()
  _id?: number

  @Prop({ unique: true })
  name: string
}
