import { modelOptions, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'tasks' } })
export class UploadTaskModel {
  @prop({ auto: true })
  _id?: Types.ObjectId

  @prop({ required: true, unique: true })
  album: string

  @prop({ required: true, alias: 'srcDirectory' })
  src_directory?: string

  srcDirectory?: string

  @prop({ default: true })
  internal?: boolean

  @prop({ default: false })
  disabled?: boolean

  @prop({ required: true, type: () => [String] })
  rules: string[]
}
