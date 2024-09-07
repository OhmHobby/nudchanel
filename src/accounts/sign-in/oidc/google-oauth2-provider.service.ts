import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { oauth2_v2 } from 'googleapis'
import { Types } from 'mongoose'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { Config } from 'src/enums/config.enum'
import { SignInService } from '../sign-in.service'
import { ExternalOauth2ProviderService } from './external-oauth2-provider.service'
import { GoogleUser } from './google-user'
import { OidcProvider } from 'src/enums/oidc-provider.enum'

@Injectable()
export class GoogleOauth2ProviderService extends ExternalOauth2ProviderService<GoogleUser> {
  constructor(
    configService: ConfigService,
    signInService: SignInService,
    registrationService: RegistrationService,
    private readonly profileService: ProfileService,
  ) {
    const baseUrl = configService.getOrThrow(Config.HTTP_BASEURL_ACCOUNTS)
    super(OidcProvider.Google, baseUrl, signInService, registrationService)
    GoogleUser.setupClient(
      configService.getOrThrow(Config.GAPIS_CLIENT_ID),
      configService.getOrThrow(Config.GAPIS_CLIENT_SECRET),
      this.getCallbackUri(configService.getOrThrow(Config.HTTP_BASEURL_ACCOUNTS)),
    )
  }

  get providerUser(): GoogleUser {
    return new GoogleUser()
  }

  async findProfileId(user: oauth2_v2.Schema$Userinfo): Promise<Types.ObjectId | undefined> {
    if (!user.id) throw new Error('No google user id')
    const profile = await this.profileService.findByGoogleId(user.id)
    return profile?._id
  }

  async createRegistrationTokenFromProviderUser(user: oauth2_v2.Schema$Userinfo) {
    if (!user.id) throw new Error('No google user id')
    const registrationDoc = await this.registrationService.createToken(
      {
        emails: user.email ? [user.email] : undefined,
        google_ids: [user.id],
      },
      true,
    )
    return registrationDoc._id
  }
}
