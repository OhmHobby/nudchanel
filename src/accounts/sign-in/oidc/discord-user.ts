import { APIUser, OAuth2API, UsersAPI } from '@discordjs/core'
import { REST } from '@discordjs/rest'
import { BadRequestException, Logger } from '@nestjs/common'
import { ExternalOidcUser } from './external-oidc-user'

export class DiscordUser extends ExternalOidcUser<APIUser> {
  private readonly logger = new Logger(DiscordUser.name)

  private readonly restClient: REST

  private readonly oauth2Client: OAuth2API

  private readonly userClient: UsersAPI

  constructor() {
    super()
    this.restClient = new REST({ authPrefix: 'Bearer' })
    this.oauth2Client = new OAuth2API(this.restClient)
    this.userClient = new UsersAPI(this.restClient)
  }

  generateSignInUrl(): string {
    return this.oauth2Client.generateAuthorizationURL({
      client_id: DiscordUser.clientId,
      response_type: 'code',
      scope: 'identify email',
      redirect_uri: DiscordUser.redirectUri,
    })
  }

  async setCredentialsFromCode(code: string) {
    try {
      const token = await this.oauth2Client.tokenExchange({
        code,
        client_id: DiscordUser.clientId,
        client_secret: DiscordUser.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: DiscordUser.redirectUri,
      })
      this.restClient.setToken(token.access_token)
    } catch (err) {
      this.logger.warn(err)
      throw new BadRequestException()
    }
    return this
  }

  async getUserInfo(): Promise<APIUser> {
    const user = await this.userClient.getCurrent()
    return user
  }

  async getProviderUser(code: string): Promise<APIUser> {
    await this.setCredentialsFromCode(code)
    return this.getUserInfo()
  }
}
