import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { TraceService } from 'nestjs-otel'
import { AccessTokenService } from 'src/accounts/access-token/access-token.service'
import { RefreshTokenService } from 'src/accounts/refresh-token/refresh-token.service'
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { CookieToken } from './cookie-token'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name)

  private readonly cookieToken: CookieToken

  constructor(
    private readonly traceService: TraceService,
    private readonly accessTokenService: AccessTokenService,
    refreshTokenService: RefreshTokenService,
  ) {
    this.cookieToken = new CookieToken(accessTokenService, refreshTokenService)
  }

  async use(req: RequestWithCtx, res: Response, nextFunction: NextFunction) {
    const span = this.traceService.startSpan(AuthMiddleware.name)
    const next = () => {
      span.end()
      return nextFunction()
    }
    try {
      span.addEvent('Verify authorization header')
      req.user = await this.accessTokenService.getUserFromHeaders(req.headers)
      if (req.user.isSignedIn()) return next()

      const cookieToken = this.cookieToken.fromHttpRequest(req)
      const currentAccessToken = cookieToken.getAccessToken()

      span.addEvent('Verify access_token cookie')
      if (currentAccessToken) req.user = await this.accessTokenService.getUserFromAccessToken(currentAccessToken)
      if (req.user.isSignedIn()) return next()

      span.addEvent('Refresh access_token cookie')
      const accessToken = await cookieToken.getUpdatedAccessToken(res, true)
      if (!accessToken) return next()

      req.user = await this.accessTokenService.getUserFromAccessToken(accessToken)

      return next()
    } catch (err) {
      this.logger.error(`Failed to set User request context.`, err)
      req.user = this.accessTokenService.getFallbackUser()
      return next()
    }
  }
}
