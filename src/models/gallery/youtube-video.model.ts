import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ActivityModel } from './activity.model'

@modelOptions({ schemaOptions: { collection: 'videos.youtube' } })
export class YoutubeVideoModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true })
  youtube: string

  @prop({ ref: () => ActivityModel, required: true, type: String })
  activity: string | Ref<ActivityModel>
}
