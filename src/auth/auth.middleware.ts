import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { VerifyAccessToken } from '@nudchannel/auth'
import { IUserOptions } from '@nudchannel/auth/lib/user/user-options.interface'
import { NextFunction, Response } from 'express'
import { AccessTokenService } from 'src/accounts/access-token/access-token.service'
import { RefreshTokenService } from 'src/accounts/refresh-token/refresh-token.service'
import { Config } from 'src/enums/config.enum'
import { CookieToken } from './cookie-token'
import { Request } from './request.interface'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly verifyAccessToken: VerifyAccessToken

  private readonly cookieToken: CookieToken

  private readonly userOptions: IUserOptions = {
    throwForbiddenHandler() {
      throw new ForbiddenException()
    },
    throwUnauthorizedHandler() {
      throw new UnauthorizedException()
    },
  }

  constructor(
    configService: ConfigService,
    accessTokenService: AccessTokenService,
    refreshTokenService: RefreshTokenService,
  ) {
    const publicKey = configService.get(Config.NUDCH_TOKEN_PUBLIC_KEY)
    this.verifyAccessToken = new VerifyAccessToken(publicKey)
    this.cookieToken = new CookieToken(accessTokenService, refreshTokenService)
  }

  async use(req: Request, res: Response, next: NextFunction) {
    req.user = await this.verifyAccessToken.userFromHeaders(req.headers, this.userOptions)
    if (req.user.isSignedIn()) {
      return next()
    }
    const cookieToken = this.cookieToken.fromHttpRequest(req)
    const accessToken = await cookieToken.getUpdatedAccessToken(res)
    if (!accessToken) {
      return next()
    }
    req.user = await this.verifyAccessToken.fromAccessToken(accessToken, this.userOptions)
    next()
  }
}
