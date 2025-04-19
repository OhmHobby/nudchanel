import dayjs from 'dayjs'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileId } from 'src/models/types'
import { TestData } from 'test/test-data'
import { uuidv4 } from 'uuidv7'

export class RefreshTokenBuilder {
  private readonly refreshToken: RefreshTokenEntity

  constructor() {
    this.refreshToken = new RefreshTokenEntity()
    this.refreshToken.id = 'b4e94836-12c6-4bab-b0b9-95bd84a53e60'
    this.refreshToken.profileId = ObjectIdUuidConverter.toUuid(TestData.aValidUserId)
    this.refreshToken.createdAt = dayjs().toDate()
    this.refreshToken.expiresAt = dayjs().add(1, 'hours').toDate()
  }

  withUuid(id = uuidv4()) {
    this.refreshToken.id = id
    return this
  }

  withProfile(profile: ProfileId) {
    this.refreshToken.profileId = ObjectIdUuidConverter.toUuid(profile)
    return this
  }

  build() {
    return this.refreshToken
  }
}
