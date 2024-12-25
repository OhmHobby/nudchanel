import { index, modelOptions, prop } from '@typegoose/typegoose'
import { ProfileIdDto } from 'src/accounts/dto/profile-id.dto'
import { GalleryBaseModel } from './base.model'

@modelOptions({ schemaOptions: { collection: 'activities' } })
@index({ timestamp: 1, _id: 1 })
export class GalleryActivityModel extends GalleryBaseModel {
  constructor(model?: Partial<GalleryActivityModel>) {
    super()
    Object.assign(this, model)
  }

  @prop({ text: true })
  description?: string

  @prop({ required: true, type: Date })
  time: Date

  @prop({ default: () => [], type: ProfileIdDto })
  contributors?: ProfileIdDto[]

  @prop({ default: () => [], text: true, trim: true, dim: 1, type: String })
  tags?: string[]
}
