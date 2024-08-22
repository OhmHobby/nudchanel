import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { TraceService } from 'nestjs-otel'
import { AccessTokenService } from 'src/accounts/access-token/access-token.service'
import { RefreshTokenService } from 'src/accounts/refresh-token/refresh-token.service'
import { CookieToken } from './cookie-token'
import { Request } from './request.interface'

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

  async use(req: Request, res: Response, next: NextFunction) {
    const span = this.traceService.startSpan(AuthMiddleware.name)
    try {
      req.user = await this.accessTokenService.getUserFromHeaders(req.headers)
      if (req.user.isSignedIn()) return next()

      const cookieToken = this.cookieToken.fromHttpRequest(req)
      const accessToken = await cookieToken.getUpdatedAccessToken(res)
      if (!accessToken) return next()

      req.user = await this.accessTokenService.getUserFromAccessToken(accessToken)
      span.end()
      next()
    } catch (err) {
      this.logger.error(`Failed to set User request context.`, err)
      req.user = this.accessTokenService.getFallbackUser()
      span.end()
      next()
    }
  }
}
