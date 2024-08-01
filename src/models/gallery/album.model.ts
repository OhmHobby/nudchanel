import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { GalleryActivityModel } from './activity.model'
import { GalleryBaseModel } from './base.model'

@modelOptions({ schemaOptions: { collection: 'albums' } })
export class GalleryAlbumModel extends GalleryBaseModel {
  @prop({ ref: GalleryActivityModel, required: true, type: String })
  activity: string | Ref<GalleryActivityModel>

  @prop({ required: true, default: 0 })
  rank?: number
}
