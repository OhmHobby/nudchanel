import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBadRequestResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { CookieToken } from 'src/auth/cookie-token'
import { AccessTokenService } from '../access-token/access-token.service'
import { RefreshTokenService } from './refresh-token.service'

@Controller({ path: 'accounts/refresh-token', version: '1' })
@ApiTags('RefreshTokenV1')
export class RefreshTokenV1Controller {
  private readonly cookieToken: CookieToken

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessTokenService: AccessTokenService,
  ) {
    this.cookieToken = new CookieToken(this.accessTokenService, this.refreshTokenService)
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestResponse({ description: `No cookie name \`${CookieToken.REFRESH_TOKEN_COOKIE_NAME}\`` })
  @ApiUnauthorizedResponse({ description: 'Token expired' })
  async refreshToken(
    @Req() request: Pick<Request, 'cookies'>,
    @Res() response: Pick<Response, 'cookie' | 'sendStatus'>,
  ) {
    const cookieToken = this.cookieToken.fromHttpRequest(request)
    if (!cookieToken.refreshToken) {
      throw new BadRequestException(`No cookie name \`${CookieToken.REFRESH_TOKEN_COOKIE_NAME}\``)
    }

    const accessToken = await cookieToken.getUpdatedAccessToken(response)
    if (!accessToken) {
      throw new UnauthorizedException('Refresh token expired')
    }

    response.sendStatus(HttpStatus.NO_CONTENT)
  }
}
