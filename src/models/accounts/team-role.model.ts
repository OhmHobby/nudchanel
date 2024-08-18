import { modelOptions, Prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'teams.roles' } })
export class TeamRoleModel {
  constructor(model?: Partial<TeamRoleModel>) {
    Object.assign(this, model)
  }

  _id: Types.ObjectId

  @Prop({ type: String, required: true, index: true, unique: true })
  name: string

  @Prop({ type: Number })
  rank: number

  @Prop({ type: String, required: false })
  emoji: string
}
