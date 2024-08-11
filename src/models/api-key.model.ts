import { modelOptions, Prop } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { MUUID } from 'uuid-mongodb'

@modelOptions({
  schemaOptions: { collection: 'api_keys' },
})
export class ApiKeyModel {
  constructor(model?: Partial<ApiKeyModel>) {
    Object.assign(this, model)
  }

  @Prop({ type: Schema.Types.UUID, required: true })
  _id: Buffer | MUUID

  @Prop({ required: true })
  service: string
}
