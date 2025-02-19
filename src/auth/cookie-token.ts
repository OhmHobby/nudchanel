import { Response } from 'express'
import { AccessTokenService } from 'src/accounts/access-token/access-token.service'
import { RefreshTokenService } from 'src/accounts/refresh-token/refresh-token.service'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { RequestWithCtx } from 'src/interfaces/request.interface'

export class CookieToken {
  static readonly ACCESS_TOKEN_COOKIE_NAME = 'access_token'

  static readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'

  private _accessToken?: string

  private _refreshToken?: string

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  get refreshToken() {
    return this._refreshToken
  }

  protected fromCookies(cookies: Record<string, string | undefined>) {
    this._accessToken = cookies[CookieToken.ACCESS_TOKEN_COOKIE_NAME]
    this._refreshToken = cookies[CookieToken.REFRESH_TOKEN_COOKIE_NAME]
    return this
  }

  fromHttpRequest(request: Pick<RequestWithCtx, 'cookies'>) {
    const instance = new CookieToken(this.accessTokenService, this.refreshTokenService)
    return instance.fromCookies(request.cookies)
  }

  getAccessToken() {
    return this._accessToken
  }

  async getUpdatedAccessToken(
    response?: Pick<Response, 'cookie'>,
    isExpired = !this._accessToken,
  ): Promise<string | undefined> {
    if (isExpired && this._refreshToken) {
      await this.refreshAccessToken(response)
    }
    return this._accessToken
  }

  private async refreshAccessToken(response?: Pick<Response, 'cookie'>): Promise<string | undefined> {
    const refreshToken = await this.refreshTokenService.use(this._refreshToken!)
    if (!refreshToken) return

    const expires = this.refreshTokenService.tokenCookieExpires(refreshToken)
    this._accessToken = await this.accessTokenService.generateAccessToken(
      ObjectIdUuidConverter.toObjectId(refreshToken.profileId),
    )
    this._refreshToken = refreshToken.id
    if (response) {
      this.accessTokenService.setHttpAccessTokenCookie(response, this._accessToken, expires)
      this.refreshTokenService.setHttpRefreshTokenCookie(response, this._refreshToken, expires)
    }
    return this._accessToken
  }
}
