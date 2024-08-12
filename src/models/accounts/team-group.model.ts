import { modelOptions, Prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'teams.groups' } })
export class TeamGroupModel {
  _id: Types.ObjectId

  @Prop({ type: String, required: true, index: true, unique: true })
  name: string

  @Prop({ type: Number })
  rank: number
}
