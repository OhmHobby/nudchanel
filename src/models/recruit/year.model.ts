import { DocumentType, modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { FormCollectionModel } from './form-collections.model'

@modelOptions({ schemaOptions: { collection: 'years' } })
export class YearModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  year: number

  @prop({ required: true })
  name: string

  @prop({ required: true })
  open: Date

  @prop({ required: true })
  close: Date

  @prop({ required: true })
  announce: Date

  @prop({ required: true, alias: 'maximumRole', default: 1 })
  maximum_role?: number

  maximumRole?: number

  @prop({ default: [], ref: () => FormCollectionModel })
  collections?: Ref<FormCollectionModel>[]

  @prop({ default: [], ref: () => FormCollectionModel })
  surveys?: Ref<FormCollectionModel>[]
}

export type YearModelKey = keyof YearModel
export type YearModelType = typeof YearModel

export type YearDocument = DocumentType<YearModel>
export type YearLeanDocument = Pick<YearDocument, YearModelKey>
