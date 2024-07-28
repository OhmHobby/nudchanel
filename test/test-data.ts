import { Types } from 'mongoose'
import { AppBuilder } from './builder/app-builder'
import { AccessTokenBuilder } from './builder/access-token-builder'
import { SupertestCookiesBuilder } from './builder/supertest-cookies-builder'
import { RefreshTokenBuilder } from './builder/refresh-token-builder'

export class TestData {
  static aValidUserId = new Types.ObjectId('6592008029c8c3e4dc76256c')

  static aValidAccessToken = () => new AccessTokenBuilder()

  static aValidRefreshToken = () => new RefreshTokenBuilder()

  static aValidSupertestCookies = () => new SupertestCookiesBuilder()

  static aValidApp = () => new AppBuilder().withDefaultMockModules()
}
