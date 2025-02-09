import { Types } from 'mongoose'
import { AccessTokenBuilder } from './builder/access-token-builder'
import { AppBuilder } from './builder/app-builder'
import { GalleryAlbumBuilder } from './builder/gallery-album-builder'
import { RefreshTokenBuilder } from './builder/refresh-token-builder'
import { SupertestCookiesBuilder } from './builder/supertest-cookies-builder'
import { GalleryActivityBuilder } from './builder/gallery-activity-builder'
import { YouTubeVideoBuilder } from './builder/gallery-video-builder'
import { UserLocalBuilder } from './builder/user-local-builder'
import { ConsumeMessageBuilder } from './builder/consume-message.builder'
import { GalleryYouTubeVideoBuilder } from './builder/gallery-youtube-video-builder'
import { ProfileBuilder } from './builder/profile-builder'
import { GalleryPhotoBuilder } from './builder/gallery-photo-builder'

export class TestData {
  static anExpiredAccessToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmODU0ZWJmYzJkMTIzYjQ2NzE4MzA0MCIsImdyb3VwcyI6WyJudWRjaCIsIm51ZGNoXzIwMjIiLCJudWRjaF8yMDIxIiwiYWRtaW4iLCJpdCJdLCJuYW1lIjoiRGV2ZWxvcG1lbnQgVXNlciIsInBob3RvIjoiaHR0cHM6Ly93d3cubnVkY2hhbm5lbC5jb20vY292ZXIucG5nIiwiaWF0IjoxNzIzMzc0Nzg1LCJleHAiOjE3MjMzNzQ3ODUsImlzcyI6ImFjY291bnRzLm51ZGNoYW5uZWwuY29tIiwic3ViIjoiNWY4NTRlYmZjMmQxMjNiNDY3MTgzMDQwIn0.QkGY_uRNz5ISSd6DidI-EqVuCdaG3Mq1DeClJ8Vt2Fwy6cIRPYKjjB2RkDfo66M6a7PMBsKJ-4QPK9c_5yEHbA7vFnuJoO6a7n-AaAc87cDANOIgoJ5WKokpPtmjgfgoPemVvNBVXyaah0j7QE5c23ktT9Pk20uRp3YJSjXgDmmz0pYOrrhlcLT4ymb_ajuca0V4obj81bixvwmYDD3LiIERhpGJYeX-B0N-TfF0qCcZmQgZlciOaOOOwJhZ9NYjNjX_4NyDQ6JyVkbnTX5ciHyxG3NZMnfoYdQDtRWawcfb1HUdbCKkqFpUwUIHGKxkF9uuOpCEldr0Qxw9yvlYuA'

  static aValidUserId = new Types.ObjectId('6592008029c8c3e4dc76256c')

  static aValidAccessToken = () => new AccessTokenBuilder()

  static aValidRefreshToken = () => new RefreshTokenBuilder()

  static aValidUserLocal = () => new UserLocalBuilder()

  static aValidProfile = () => new ProfileBuilder()

  static aValidGalleryActivity = () => new GalleryActivityBuilder()

  static aValidGalleryAlbum = () => new GalleryAlbumBuilder()

  static aValidGalleryPhoto = () => new GalleryPhotoBuilder()

  static aValidYouTubeVideo = () => new YouTubeVideoBuilder()

  static aValidGalleryYouTubeVideo = () => new GalleryYouTubeVideoBuilder()

  static aValidSupertestCookies = () => new SupertestCookiesBuilder()

  static aValidConsumeMessage = () => new ConsumeMessageBuilder()

  static aValidApp = () => new AppBuilder().withDefaultMockModules()
}
