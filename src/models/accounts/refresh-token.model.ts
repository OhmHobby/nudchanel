import { modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { toBuffer, toString } from 'uuid-buffer'
import { uuidv4 } from 'uuidv7'
import { ProfileModel } from './profile.model'

@modelOptions({ schemaOptions: { collection: 'tokens.refresh' } })
export class RefreshTokenModel {
  constructor(model?: Partial<RefreshTokenModel>) {
    Object.assign(this, model)
  }

  @Prop({
    type: Buffer,
    subtype: 4,
    get: (_) => (_ ? toString(_) : _),
    set: toBuffer,
    default: uuidv4,
  })
  _id?: string | Buffer

  @Prop({ ref: () => ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ type: Date, default: Date.now })
  created_at?: Date

  @Prop({ type: Date, default: Date.now })
  expires_at?: Date

  @Prop({ ref: () => RefreshTokenModel, type: Buffer, default: null })
  new_token?: Ref<RefreshTokenModel>
}
