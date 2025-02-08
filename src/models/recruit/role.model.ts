import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { FormCollectionModel } from './form-collections.model'
import { YearModel } from './year.model'

@modelOptions({ schemaOptions: { collection: 'roles' } })
export class RoleModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true, ref: () => YearModel })
  year: Ref<YearModel>

  @prop({ required: true })
  name: string

  @prop({ required: true })
  description: string

  @prop({
    required: false,
    ref: () => FormCollectionModel,
    alias: 'collectionId',
  })
  collection_id: Ref<FormCollectionModel>

  collectionId?: Types.ObjectId

  @prop({ required: true })
  rank: number

  @prop({ default: false })
  mandatory?: boolean
}
