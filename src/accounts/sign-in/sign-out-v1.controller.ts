import { Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { CookieToken } from 'src/auth/cookie-token'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'

@Controller({ path: 'accounts/sign-out', version: '1' })
@ApiTags('SignInV1')
export class SignOutV1Controller {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(
    @Req() request: Pick<Request, 'cookies'>,
    @Res() response: Pick<Response, 'clearCookie' | 'sendStatus'>,
  ) {
    const refreshToken = request.cookies[CookieToken.REFRESH_TOKEN_COOKIE_NAME]
    if (refreshToken) await this.refreshTokenService.revokeToken(refreshToken)
    response.clearCookie(CookieToken.ACCESS_TOKEN_COOKIE_NAME)
    response.clearCookie(CookieToken.REFRESH_TOKEN_COOKIE_NAME)
    response.sendStatus(HttpStatus.NO_CONTENT)
  }
}
