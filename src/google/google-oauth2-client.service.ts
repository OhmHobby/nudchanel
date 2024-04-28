import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import { Auth, google } from 'googleapis'
import { Config } from 'src/enums/config.enum'
import { GoogleCredentialModel } from 'src/models/google-credential.model'

@Injectable()
export class GoogleOauth2ClientService {
  protected readonly email: string

  constructor(
    @InjectModel(GoogleCredentialModel)
    protected readonly googleCredentialModel: ReturnModelType<typeof GoogleCredentialModel>,
    protected readonly configService: ConfigService,
  ) {
    this.email = configService.get(Config.GAPIS_EMAIL, '')
  }

  createClient(): Auth.OAuth2Client {
    const clientId = this.configService.get(Config.GAPIS_CLIENT_ID)
    const clientSecret = this.configService.get(Config.GAPIS_CLIENT_SECRET)
    const redirectUri = this.configService.get(Config.GAPIS_CALLBACK)
    return new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri,
    })
  }

  async getClientWithCredential(): Promise<Auth.OAuth2Client> {
    const { token } = await this.googleCredentialModel.findById(this.email).orFail().exec()
    const client = this.createClient()
    client.setCredentials(token)
    await this.updateCredential(client)
    return client
  }

  async setCredential(code: string): Promise<boolean> {
    const { tokens } = await this.createClient().getToken(code)
    const { _id } = await this.googleCredentialModel
      .findOneAndUpdate(
        { _id: this.email },
        { _id: this.email, token: tokens },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec()
    return _id === this.email
  }

  async updateCredential(client: Pick<Auth.OAuth2Client, 'getAccessToken'>): Promise<void> {
    const { res } = await client.getAccessToken()
    if (!res) {
      return
    }
    await this.googleCredentialModel.updateOne({ _id: this.email }, { token: res.data })
  }
}
