import { prop } from '@typegoose/typegoose'
import { nanoid } from 'nanoid'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'

export abstract class GalleryBaseModel {
  constructor(model?: Partial<GalleryBaseModel>) {
    Object.assign(this, model)
  }

  @prop({ default: () => nanoid(GALLERY_ID_LENGTH) })
  _id?: string

  @prop({ required: true, text: true, trim: true })
  title: string

  @prop()
  cover?: string

  @prop({ required: true, default: false })
  published?: boolean

  @prop({ required: true, default: Date.now, alias: 'publishedAt' })
  published_at?: Date

  publishedAt?: Date | string

  @prop({ required: true, default: Date.now, alias: 'updatedAt' })
  updated_at?: Date

  updatedAt?: Date

  @prop({ required: true, default: Date.now, alias: 'createdAt' })
  created_at?: Date

  createdAt?: Date

  @prop({ default: false, required: true })
  deleted?: boolean
}
