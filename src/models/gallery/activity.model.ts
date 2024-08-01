import { index, modelOptions, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { GalleryBaseModel } from './base.model'

@modelOptions({ schemaOptions: { collection: 'activities' } })
@index({ timestamp: 1, _id: 1 })
export class GalleryActivityModel extends GalleryBaseModel {
  @prop({ text: true })
  description?: string

  @prop({ required: true, type: Date })
  time: Date

  @prop({ default: () => [], type: Types.ObjectId })
  contributors?: Types.ObjectId[]

  @prop({ default: () => [], text: true, trim: true, dim: 1, type: String })
  tags?: string[]
}
