import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Auth, google } from 'googleapis'
import { Span } from 'nestjs-otel'
import { ApplicationSettingService } from 'src/application-setting/application-setting.service'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class GoogleOauth2ClientService {
  private readonly logger = new Logger(GoogleOauth2ClientService.name)

  constructor(
    protected readonly configService: ConfigService,
    private readonly applicationSettingService: ApplicationSettingService,
  ) {}

  @Span()
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

  @Span()
  async getClientWithCredential(): Promise<Auth.OAuth2Client> {
    const tokenString = await this.applicationSettingService.getGoogleCredential()
    const token = JSON.parse(tokenString) as Auth.Credentials
    const client = this.createClient()
    client.setCredentials(token)
    await this.updateCredential(client)
    return client
  }

  @Span()
  async updateCredential(client: Pick<Auth.OAuth2Client, 'getAccessToken'>): Promise<void> {
    const { res } = await client.getAccessToken()
    if (!res) return
    await this.applicationSettingService.setGoogleCredential(JSON.stringify(res.data))
    this.logger.log(`Updated service account credential`)
  }
}
