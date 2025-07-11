import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { Auth, oauth2_v2 } from 'googleapis'
import { AuthProviderResponseModel } from 'src/accounts/models/auth-provider.response.model'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { ProfileId } from 'src/models/types'
import { ExternalOauth2ProviderService } from '../external-oauth2-provider.service'
import { UnintializedGoogleOauth2, UnintializedGoogleOauth2Client } from './uninitialized-google.types'

@Injectable()
export class GoogleOauth2ProviderService extends ExternalOauth2ProviderService<oauth2_v2.Schema$Userinfo> {
  private readonly logger = new Logger(GoogleOauth2ProviderService.name)

  protected readonly providerName = OidcProvider.Google

  constructor(
    registrationService: RegistrationService,
    private readonly profileService: ProfileService,
    @Inject(ServiceProvider.GOOGLE_OAUTH2_CLIENT)
    private readonly oauth2Client: UnintializedGoogleOauth2Client,
    @Inject(ServiceProvider.GOOGLE_OAUTH2)
    private readonly oauth2: UnintializedGoogleOauth2,
  ) {
    super(registrationService)
  }

  getProviderInfo(baseUrl: string) {
    return new AuthProviderResponseModel({
      provider: OidcProvider.Google,
      url: this.generateSignInUrl(this.redirectUri(baseUrl)),
    })
  }

  async findProfileId(user: oauth2_v2.Schema$Userinfo): Promise<ProfileId | undefined> {
    if (!user.id) throw new Error('Missing google user id')
    const profile = await this.profileService.findByGoogleId(user.id)
    return profile?._id
  }

  async getProviderUser(code: string, redirectUri: string): Promise<oauth2_v2.Schema$Userinfo> {
    const oauth2Client = await this.getOauth2ClientFromCode(code, redirectUri)
    const { data } = await this.oauth2(oauth2Client).userinfo.get()
    return data
  }

  async createRegistrationTokenFromProviderUser(user: oauth2_v2.Schema$Userinfo) {
    if (!user.id) throw new Error('Missing google user id')
    const registrationDoc = await this.registrationService.createToken(
      {
        emails: user.email ? [user.email] : undefined,
        google_ids: [user.id],
      },
      true,
    )
    return registrationDoc._id
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMfaEnabled(user: oauth2_v2.Schema$Userinfo): boolean {
    return false
  }

  private generateSignInUrl(redirectUri: string): string {
    return this.oauth2Client(redirectUri).generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: 'email',
      redirect_uri: redirectUri,
    })
  }

  private async getOauth2ClientFromCode(code: string, redirectUri: string): Promise<Auth.OAuth2Client> {
    try {
      const oauth2Client = this.oauth2Client(redirectUri)
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)
      return oauth2Client
    } catch (err) {
      this.logger.warn(err)
      throw new BadRequestException(err.message)
    }
  }
}
