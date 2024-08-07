import { modelOptions, prop, Severity } from '@typegoose/typegoose'
import { Schema, Types } from 'mongoose'
import { MUUID } from 'uuid-mongodb'

export const AUDIT_LOG_COLLECTION_NAME = 'audit.logs'

@modelOptions({ schemaOptions: { collection: AUDIT_LOG_COLLECTION_NAME }, options: { allowMixed: Severity.ALLOW } })
export class AuditLogModel {
  constructor(model: Partial<AuditLogModel>) {
    Object.assign(this, model)
  }

  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ type: Schema.Types.UUID })
  correlation_id?: Buffer | MUUID

  @prop()
  actor?: Types.ObjectId

  @prop()
  action: String

  @prop()
  path: String

  @prop()
  params: object

  @prop()
  queries: object

  @prop()
  body: object
}
