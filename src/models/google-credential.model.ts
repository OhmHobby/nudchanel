import { modelOptions, Prop, Severity } from '@typegoose/typegoose'
import { Auth } from 'googleapis'

@modelOptions({
  schemaOptions: { collection: 'google.credentials' },
  options: { allowMixed: Severity.ALLOW },
})
export class GoogleCredentialModel {
  @Prop()
  _id: string

  @Prop()
  token: Auth.Credentials
}
