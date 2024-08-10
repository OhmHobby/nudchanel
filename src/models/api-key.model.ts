import { modelOptions, Prop } from '@typegoose/typegoose'
import { Exclude, Expose } from 'class-transformer'
import { Schema } from 'mongoose'
import { MUUID } from 'uuid-mongodb'

@modelOptions({
  schemaOptions: { collection: 'api_keys' },
})
@Exclude()
export class ApiKeyModel {
  constructor(model?: Partial<ApiKeyModel>) {
    Object.assign(this, model)
  }

  @Prop({ type: Schema.Types.UUID, required: true })
  _id: Buffer | MUUID

  @Prop({ required: true })
  @Expose()
  service: String

  @Expose()
  get id(): string {
    return this._id?.toString()
  }
}
