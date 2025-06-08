import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import dayjsDuration from 'dayjs/plugin/duration'
import { Response } from 'express'
import { CookieToken } from 'src/auth/cookie-token'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { Config } from 'src/enums/config.enum'
import { IsNull, MoreThan, MoreThanOrEqual, Repository } from 'typeorm'

dayjs.extend(dayjsDuration)

const DEFAULT_REFRESH_TOKEN_DURATION = dayjs.duration({ days: 30 })
const SESSION_REFRESH_TOKEN_DURATION = dayjs.duration({ hours: 8 })

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly configService: ConfigService,
  ) {}

  refreshTokenExpires(sessionToken = false): Date {
    const sessionDuration = sessionToken ? SESSION_REFRESH_TOKEN_DURATION : DEFAULT_REFRESH_TOKEN_DURATION
    return dayjs().add(sessionDuration).toDate()
  }

  async create(profileUid: string, sessionToken = false): Promise<RefreshTokenEntity> {
    const refreshToken = new RefreshTokenEntity({
      profileId: profileUid,
      expiresAt: this.refreshTokenExpires(sessionToken),
    })
    return await this.refreshTokenRepository.save(refreshToken)
  }

  async update(refreshToken: string, expiresAt: Date, newToken: string) {
    const result = await this.refreshTokenRepository.update(
      { id: refreshToken, expiresAt: MoreThanOrEqual(new Date()) },
      { expiresAt, nextToken: newToken },
    )
    return !!result.affected
  }

  async remove(refreshToken: string) {
    const result = await this.refreshTokenRepository.delete({ id: refreshToken })
    return !!result.affected
  }

  find(refreshToken: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findOneBy({ id: refreshToken, expiresAt: MoreThan(new Date()) })
  }

  revokeToken(toRevokeRefreshToken: string, newRefreshToken?: string) {
    if (newRefreshToken) {
      const fiveSecondExtendedPeriod = 5
      const extendedDate = dayjs().add(fiveSecondExtendedPeriod, 'second').toDate()

      return this.update(toRevokeRefreshToken, extendedDate, newRefreshToken)
    } else {
      return this.remove(toRevokeRefreshToken)
    }
  }

  async isExpired(refreshToken: string) {
    const hasValidToken = await this.refreshTokenRepository.existsBy({
      id: refreshToken,
      expiresAt: MoreThan(new Date()),
      nextToken: IsNull(),
    })
    return !hasValidToken
  }

  async use(refreshToken: string): Promise<RefreshTokenEntity | null> {
    const currentRefreshToken = await this.find(refreshToken)
    if (!currentRefreshToken) {
      return null
    }

    const issuedRefreshToken = currentRefreshToken.nextToken
    if (issuedRefreshToken) {
      currentRefreshToken.id = issuedRefreshToken
      return currentRefreshToken
    }

    if (!this.shouldReIssue(currentRefreshToken)) {
      return currentRefreshToken
    }

    const isSessionToken = this.isSessionToken(currentRefreshToken.createdAt, currentRefreshToken.expiresAt)

    const profileId = currentRefreshToken.profileId
    const newRefreshToken = await this.create(profileId, isSessionToken)
    await this.revokeToken(refreshToken, newRefreshToken.id)

    currentRefreshToken.id = newRefreshToken.id
    return currentRefreshToken
  }

  isSessionToken(createdAt: Date, expiresAt: Date) {
    const defaultTokenExpiresAt = dayjs(createdAt).add(DEFAULT_REFRESH_TOKEN_DURATION).subtract(1, 'minute')
    return dayjs(expiresAt).isBefore(defaultTokenExpiresAt)
  }

  tokenCookieExpires(refreshToken: RefreshTokenEntity): Date | undefined {
    return this.isSessionToken(refreshToken.createdAt, refreshToken.expiresAt) ? undefined : this.refreshTokenExpires()
  }

  shouldReIssue(refreshToken: RefreshTokenEntity, now = new Date()): boolean {
    return (
      now.getTime() - refreshToken.createdAt.getTime() >=
      SESSION_REFRESH_TOKEN_DURATION.subtract({ hours: 1 }).asMilliseconds()
    )
  }

  setHttpRefreshTokenCookie(response: Pick<Response, 'cookie'>, refreshToken: string, expires?: Date) {
    response.cookie(CookieToken.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      expires,
      httpOnly: true,
      secure: this.configService.get<boolean>(Config.NUDCH_TOKEN_SECURE),
    })
  }
}
