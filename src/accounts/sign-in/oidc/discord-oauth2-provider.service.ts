import { APIUser } from '@discordjs/core'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Types } from 'mongoose'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { Config } from 'src/enums/config.enum'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { SignInService } from '../sign-in.service'
import { DiscordUser } from './discord-user'
import { ExternalOauth2ProviderService } from './external-oauth2-provider.service'

@Injectable()
export class DiscordOauth2ProviderService extends ExternalOauth2ProviderService<DiscordUser> {
  constructor(
    configService: ConfigService,
    signInService: SignInService,
    registrationService: RegistrationService,
    private readonly profileService: ProfileService,
  ) {
    const baseUrl = configService.getOrThrow(Config.HTTP_BASEURL_ACCOUNTS)
    super(OidcProvider.Discord, baseUrl, signInService, registrationService)
    DiscordUser.setupClient(
      configService.getOrThrow(Config.DISCORD_CLIENT_ID),
      configService.getOrThrow(Config.DISCORD_CLIENT_SECRET),
      this.getCallbackUri(baseUrl),
    )
  }

  get providerUser(): DiscordUser {
    return new DiscordUser()
  }

  async findProfileId(user: APIUser): Promise<Types.ObjectId | undefined> {
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
}
