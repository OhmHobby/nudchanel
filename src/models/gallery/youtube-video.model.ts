import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { GalleryActivityModel } from './activity.model'

@modelOptions({ schemaOptions: { collection: 'videos.youtube' } })
export class YouTubeVideoModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  youtube: string

  @prop({ ref: () => GalleryActivityModel, required: true, type: String })
  activity: string | Ref<GalleryActivityModel>
}
