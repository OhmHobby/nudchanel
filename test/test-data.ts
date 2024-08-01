import { Types } from 'mongoose'
import { AccessTokenBuilder } from './builder/access-token-builder'
import { AppBuilder } from './builder/app-builder'
import { GalleryAlbumBuilder } from './builder/gallery-album-builder'
import { RefreshTokenBuilder } from './builder/refresh-token-builder'
import { SupertestCookiesBuilder } from './builder/supertest-cookies-builder'
import { GalleryActivityBuilder } from './builder/gallery-activity-builder'
import { YouTubeVideoBuilder } from './builder/gallery-video-builder'

export class TestData {
  static aValidUserId = new Types.ObjectId('6592008029c8c3e4dc76256c')

  static aValidAccessToken = () => new AccessTokenBuilder()

  static aValidRefreshToken = () => new RefreshTokenBuilder()

  static aValidGalleryActivity = () => new GalleryActivityBuilder()

  static aValidGalleryAlbum = () => new GalleryAlbumBuilder()

  static aValidYouTubeVideo = () => new YouTubeVideoBuilder()

  static aValidSupertestCookies = () => new SupertestCookiesBuilder()

  static aValidApp = () => new AppBuilder().withDefaultMockModules()
}
