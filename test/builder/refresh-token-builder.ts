import dayjs from 'dayjs'
import { Types } from 'mongoose'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { TestData } from 'test/test-data'
import { uuidv4 } from 'uuidv7'

export class RefreshTokenBuilder {
  private readonly refreshToken: RefreshTokenModel

  constructor() {
    this.refreshToken = new RefreshTokenModel()
    this.refreshToken._id = 'b4e94836-12c6-4bab-b0b9-95bd84a53e60'
    this.refreshToken.profile = TestData.aValidUserId
    this.refreshToken.created_at = dayjs().toDate()
    this.refreshToken.expires_at = dayjs().add(1, 'hours').toDate()
  }

  withUuid(id = uuidv4()) {
    this.refreshToken._id = id
    return this
  }

  withProfile(profile: Types.ObjectId) {
    this.refreshToken.profile = profile
    return this
  }

  build() {
    return this.refreshToken
  }
}
