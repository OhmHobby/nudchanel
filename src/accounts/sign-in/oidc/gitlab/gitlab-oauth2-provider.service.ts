import { Gitlab, UserSchema } from '@gitbeaker/rest'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthProviderResponseModel } from 'src/accounts/models/auth-provider.response.model'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { Config } from 'src/enums/config.enum'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ProfileId } from 'src/models/types'
import { ExternalOauth2ProviderService } from '../external-oauth2-provider.service'

@Injectable()
export class GitlabOauth2ProviderService extends ExternalOauth2ProviderService<UserSchema> {
  private readonly logger = new Logger(GitlabOauth2ProviderService.name)

  protected readonly providerName = OidcProvider.GitLab

  private readonly clientId: string

  private readonly clientSecret: string

  private readonly instanceUrl: string

  constructor(
    configService: ConfigService,
    registrationService: RegistrationService,
    private readonly profileService: ProfileService,
  ) {
    super(registrationService)
    this.clientId = configService.getOrThrow(Config.GITLAB_CLIENT_ID)
    this.clientSecret = configService.getOrThrow(Config.GITLAB_CLIENT_SECRET)
    this.instanceUrl = configService.getOrThrow(Config.GITLAB_INSTANCE_URL)
  }

  getProviderInfo(baseUrl: string) {
    return new AuthProviderResponseModel({
      provider: OidcProvider.GitLab,
      url: this.generateSignInUrl(this.redirectUri(baseUrl)),
    })
  }

  async getProviderUser(code: string, redirectUri: string): Promise<UserSchema> {
    const accessToken = await this.getAccessTokenFromCode(code, redirectUri)

    const gitlabClient = new Gitlab({
      host: this.instanceUrl,
      oauthToken: accessToken,
    })

    return await gitlabClient.Users.showCurrentUser()
  }

  async findProfileId(user: UserSchema): Promise<ProfileId | undefined> {
    const profileById = await this.profileService.findByGitlabId(user.id.toString())
    if (profileById?._id) {
      return profileById._id
    }
    const profileByEmail = await this.profileService.findByEmail(String(user.email))
    if (profileByEmail?._id) {
      return profileByEmail._id
    }
    return undefined
  }

  async createRegistrationTokenFromProviderUser(user: UserSchema) {
    const registrationDoc = await this.registrationService.createToken(
      {
        emails: user.email ? [String(user.email)] : undefined,
        gitlab_ids: [user.id.toString()],
      },
      true,
    )
    return registrationDoc._id
  }

  isMfaEnabled(user: UserSchema): boolean {
    return Boolean(user.two_factor_enabled)
  }

  private generateSignInUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'read_user',
      redirect_uri: redirectUri,
    })
    return `${this.instanceUrl}/oauth/authorize?${params.toString()}`
  }

  private async getAccessTokenFromCode(code: string, redirectUri: string): Promise<string> {
    try {
      const tokenResponse = await fetch(`${this.instanceUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        throw new Error(`GitLab OAuth token exchange failed: ${error}`)
      }

      const tokenData = await tokenResponse.json()
      return tokenData.access_token
    } catch (err) {
      this.logger.warn(err)
      throw new BadRequestException(err.message)
    }
  }
}
