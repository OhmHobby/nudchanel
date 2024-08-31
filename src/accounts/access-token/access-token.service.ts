import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SignAccessToken, User, VerifyAccessToken } from '@nudchannel/auth'
import { IUserOptions } from '@nudchannel/auth/lib/user/user-options.interface'
import { Response } from 'express'
import { IncomingHttpHeaders } from 'http'
import { CookieToken } from 'src/auth/cookie-token'
import { Config } from 'src/enums/config.enum'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'
import { UserGroupService } from '../user/user-group.service'

@Injectable()
export class AccessTokenService {
  private readonly verifyAccessToken: VerifyAccessToken

  private readonly userOptions: IUserOptions = {
    throwForbiddenHandler() {
      throw new ForbiddenException()
    },
    throwUnauthorizedHandler() {
      throw new UnauthorizedException()
    },
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
    private readonly userGroupService: UserGroupService,
  ) {
    const publicKey = configService.get(Config.NUDCH_TOKEN_PUBLIC_KEY)
    this.verifyAccessToken = new VerifyAccessToken(publicKey)
  }

  async generateAccessToken(profileId: string) {
    const privateKey = this.configService.get(Config.NUDCH_TOKEN_PRIVATE_KEY)
    const issuer = this.configService.get(Config.NUDCH_TOKEN_ISSUER)
    const signAccessToken = new SignAccessToken(issuer, privateKey)
    const [profile, name, groups] = await Promise.all([
      this.profileService.findById(profileId),
      this.profileNameService.getProfileName(profileId, 'en'),
      this.userGroupService.getProfileGroups(profileId),
    ])

    const photo = PhotoUrlHelper.profileJpg(profile?.photo)

    const fullname = `${name.firstname} ${name.lastname}`

    return signAccessToken.setProfileId(profileId).setGroups(groups).setName(fullname).setPhoto(photo).sign()
  }

  setHttpAccessTokenCookie(response: Pick<Response, 'cookie'>, accessToken: string, expires?: Date) {
    response.cookie(CookieToken.ACCESS_TOKEN_COOKIE_NAME, accessToken, { expires })
  }

  async getUserFromHeaders(headers: IncomingHttpHeaders) {
    try {
      const user = await this.verifyAccessToken.userFromHeaders(headers, this.userOptions)
      return user
    } catch (err) {
      return this.getFallbackUser()
    }
  }

  async getUserFromAccessToken(accessToken: string) {
    try {
      const user = await this.verifyAccessToken.fromAccessToken(accessToken, this.userOptions)
      return user
    } catch (err) {
      return this.getFallbackUser()
    }
  }

  getFallbackUser() {
    return new User(undefined, this.userOptions)
  }
}
