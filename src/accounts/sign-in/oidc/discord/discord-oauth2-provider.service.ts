import { APIUser, OAuth2API, UsersAPI } from '@discordjs/core'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REST } from 'discord.js'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { Config } from 'src/enums/config.enum'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { ProfileId } from 'src/models/types'
import { ExternalOauth2ProviderService } from '../external-oauth2-provider.service'

@Injectable()
export class DiscordOauth2ProviderService extends ExternalOauth2ProviderService<APIUser> {
  private readonly logger = new Logger(DiscordOauth2ProviderService.name)

  protected readonly providerName = OidcProvider.Discord

  private readonly clientId: string

  private readonly clientSecret: string

  constructor(
    configService: ConfigService,
    registrationService: RegistrationService,
    @Inject(ServiceProvider.DISCORD_REST)
    private readonly newRestClient: () => REST,
    @Inject(ServiceProvider.DISCORD_OAUTH2_API)
    private readonly oauth2Client: OAuth2API,
    private readonly profileService: ProfileService,
  ) {
    super(registrationService)
    this.clientId = configService.getOrThrow(Config.DISCORD_CLIENT_ID)
    this.clientSecret = configService.getOrThrow(Config.DISCORD_CLIENT_SECRET)
  }

  async getProviderUser(code: string, redirectUri: string): Promise<APIUser> {
    const restClient = await this.getRestClientFromCode(code, redirectUri)
    const user = await new UsersAPI(restClient).getCurrent()
    return user
  }

  async findProfileId(user: APIUser): Promise<ProfileId | undefined> {
    const profile = await this.profileService.findByDiscordId(user.id)
    return profile?._id
  }

  async createRegistrationTokenFromProviderUser(user: APIUser) {
    const registrationDoc = await this.registrationService.createToken(
      {
        emails: user.email ? [user.email] : undefined,
        discord_ids: [user.id],
      },
      true,
    )
    return registrationDoc._id
  }

  protected generateSignInUrl(redirectUri: string): string {
    return this.oauth2Client.generateAuthorizationURL({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'identify email',
      redirect_uri: redirectUri,
    })
  }

  private async getRestClientFromCode(code: string, redirectUri: string) {
    try {
      const token = await this.oauth2Client.tokenExchange({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
      return this.newRestClient().setToken(token.access_token)
    } catch (err) {
      this.logger.warn(err)
      throw new BadRequestException(err.message)
    }
  }
}
