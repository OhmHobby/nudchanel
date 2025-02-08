import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { YearModel } from './year.model'

@modelOptions({ schemaOptions: { collection: 'form.collections' } })
export class FormCollectionModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  title: string

  @prop({ required: true, ref: YearModel })
  year: Ref<YearModel>
}
