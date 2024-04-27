import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as dayjs from 'dayjs'
import * as dayjsDuration from 'dayjs/plugin/duration'
import { Response } from 'express'
import { CookieToken } from 'src/auth/cookie-token'
import { Config } from 'src/enums/config.enum'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { uuidv4 } from 'uuidv7'

dayjs.extend(dayjsDuration)

const DEFAULT_REFRESH_TOKEN_DURATION = dayjs.duration({ days: 30 })
const SESSION_REFRESH_TOKEN_DURATION = dayjs.duration({ hours: 8 })

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshTokenModel)
    private readonly refreshTokenModel: ReturnModelType<typeof RefreshTokenModel>,
    private readonly configService: ConfigService,
  ) {}

  refreshTokenExpires(sessionToken = false): Date {
    const sessionDuration = sessionToken ? SESSION_REFRESH_TOKEN_DURATION : DEFAULT_REFRESH_TOKEN_DURATION
    return dayjs().add(sessionDuration).toDate()
  }

  async create(profileId: string, sessionToken = false): Promise<string> {
    const refreshTokenDocument = await this.refreshTokenModel.create({
      _id: uuidv4(),
      profile: profileId,
      expires_at: this.refreshTokenExpires(sessionToken),
    })

    return refreshTokenDocument._id.toString()
  }

  async update(refreshToken: string, expiresAt: Date, newToken: string) {
    const { modifiedCount } = await this.refreshTokenModel
      .updateOne(
        {
          _id: refreshToken,
          expires_at: { $gte: new Date() },
        },
        {
          $set: {
            expires_at: expiresAt,
            new_token: newToken,
          },
        },
      )
      .exec()

    return !!modifiedCount
  }

  async remove(refreshToken: string) {
    const { deletedCount } = await this.refreshTokenModel
      .deleteOne({
        _id: refreshToken,
      })
      .exec()

    return !!deletedCount
  }

  find(refreshToken: string): Promise<DocumentType<RefreshTokenModel> | null> {
    return this.refreshTokenModel
      .findOne({
        _id: refreshToken,
        expires_at: { $gt: new Date() },
      })
      .exec()
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
    const count = await this.refreshTokenModel
      .countDocuments({
        _id: refreshToken,
        expires_at: { $gt: new Date() },
        new_token: null,
      })
      .exec()
    return !count
  }

  async use(
    refreshToken: string,
  ): Promise<Pick<DocumentType<RefreshTokenModel>, '_id' | 'profile' | 'created_at' | 'expires_at'> | null> {
    const currentRefreshToken = await this.find(refreshToken)
    if (!currentRefreshToken) {
      return null
    }

    const issuedRefreshToken = currentRefreshToken.new_token as Buffer | undefined
    if (issuedRefreshToken) {
      currentRefreshToken._id = issuedRefreshToken
      return currentRefreshToken
    }

    const isSessionToken = this.isSessionToken(currentRefreshToken.created_at!, currentRefreshToken.expires_at!)

    const profileId = currentRefreshToken.profile.toString()
    const newRefreshToken = await this.create(profileId, isSessionToken)
    await this.revokeToken(refreshToken, newRefreshToken)

    currentRefreshToken._id = newRefreshToken
    return currentRefreshToken
  }

  isSessionToken(createdAt: Date, expiresAt: Date) {
    const defaultTokenExpiresAt = dayjs(createdAt).add(DEFAULT_REFRESH_TOKEN_DURATION).subtract(1, 'minute')
    return dayjs(expiresAt).isBefore(defaultTokenExpiresAt)
  }

  setHttpRefreshTokenCookie(response: Pick<Response, 'cookie'>, refreshToken: RefreshTokenModel) {
    const expires = this.isSessionToken(refreshToken.created_at!, refreshToken.expires_at!)
      ? undefined
      : this.refreshTokenExpires()
    response.cookie(CookieToken.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      expires,
      httpOnly: true,
      secure: this.configService.get<boolean>(Config.NUDCH_TOKEN_SECURE),
    })
  }
}
