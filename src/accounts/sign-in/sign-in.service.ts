import { Injectable, Logger } from '@nestjs/common'
import { Response } from 'express'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileId } from 'src/models/types'
import { AccessTokenService } from '../access-token/access-token.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'

@Injectable()
export class SignInService {
  private readonly logger = new Logger(SignInService.name)

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async setAccessRefreshTokenCookiesByProfile(
    response: Pick<Response, 'cookie'>,
    profileId: ProfileId,
    isSession = false,
    isMfaEnabled = false,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenService.generateAccessToken(profileId, isMfaEnabled),
      this.refreshTokenService.create(ObjectIdUuidConverter.toUuid(profileId), isSession, isMfaEnabled),
    ])
    if (!refreshToken.id) throw new Error('Failed to create refreshToken')
    const expires = this.refreshTokenService.tokenCookieExpires(refreshToken)
    this.accessTokenService.setHttpAccessTokenCookie(response, accessToken, expires)
    this.refreshTokenService.setHttpRefreshTokenCookie(response, refreshToken.id, expires)
    this.logger.log({ message: 'Successful sign-in', profileId, isSession })
  }
}
