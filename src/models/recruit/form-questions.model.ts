import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { FormCollectionModel } from './form-collections.model'

export enum FormQuestionInput {
  textarea = 'textarea',
}

@modelOptions({ schemaOptions: { collection: 'form.questions' } })
export class FormQuestionModel {
  @Prop({ auto: true })
  _id: Types.ObjectId

  @Prop({ ref: FormCollectionModel })
  collection_id: Ref<FormCollectionModel>

  @Prop()
  question: string

  @Prop()
  input: FormQuestionInput

  @Prop({ type: String, default: [] })
  options?: string[]

  @Prop({ default: 0 })
  rank?: number
}
