import { BadRequestException, Logger } from '@nestjs/common'
import { Auth, google, oauth2_v2 } from 'googleapis'
import { ExternalOidcUser } from './external-oidc-user'

export class GoogleUser extends ExternalOidcUser<oauth2_v2.Schema$Userinfo> {
  private readonly logger = new Logger(GoogleUser.name)

  private readonly oauth2Client: Auth.OAuth2Client

  private readonly oauth2: oauth2_v2.Oauth2

  constructor() {
    super()
    this.oauth2Client = new google.auth.OAuth2(GoogleUser.clientId, GoogleUser.clientSecret, GoogleUser.redirectUri)
    this.oauth2 = google.oauth2({ auth: this.oauth2Client, version: 'v2' })
  }

  generateSignInUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: 'email',
      redirect_uri: GoogleUser.redirectUri,
    })
  }

  async setCredentialsFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)
    } catch (err) {
      this.logger.warn(err)
      throw new BadRequestException()
    }
    return this
  }

  async getUserInfo(): Promise<oauth2_v2.Schema$Userinfo> {
    const { data } = await this.oauth2.userinfo.get()
    return data
  }

  async getProviderUser(code: string): Promise<oauth2_v2.Schema$Userinfo> {
    await this.setCredentialsFromCode(code)
    return this.getUserInfo()
  }
}
