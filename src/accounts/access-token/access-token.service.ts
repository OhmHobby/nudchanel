import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SignAccessToken } from '@nudchannel/auth'
import dayjs from 'dayjs'
import { Response } from 'express'
import { CookieToken } from 'src/auth/cookie-token'
import { Config } from 'src/enums/config.enum'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'
import { UserGroupService } from '../user/user-group.service'

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
    private readonly userGroupService: UserGroupService,
  ) {}

  accessTokenExpires(): Date {
    const expiresIn = 5
    return dayjs().add(expiresIn, 'minute').toDate()
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

    const photo = this.profileService.getPhotoUrl(profile?.photo)

    const fullname = `${name.firstname} ${name.lastname}`

    return signAccessToken.setProfileId(profileId).setGroups(groups).setName(fullname).setPhoto(photo).sign()
  }

  setHttpAccessTokenCookie(response: Pick<Response, 'cookie'>, accessToken: string) {
    response.cookie(CookieToken.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      expires: this.accessTokenExpires(),
    })
  }
}
