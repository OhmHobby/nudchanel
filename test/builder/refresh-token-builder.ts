import * as dayjs from 'dayjs'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { TestData } from 'test/test-data'

export class RefreshTokenBuilder {
  private readonly refreshToken: RefreshTokenModel

  constructor() {
    this.refreshToken = new RefreshTokenModel()
    this.refreshToken._id = 'b4e94836-12c6-4bab-b0b9-95bd84a53e60'
    this.refreshToken.profile = TestData.aValidUserId
    this.refreshToken.created_at = dayjs().toDate()
    this.refreshToken.expires_at = dayjs().add(1, 'hours').toDate()
  }

  build() {
    return this.refreshToken
  }
}
