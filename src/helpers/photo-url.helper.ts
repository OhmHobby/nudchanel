import config from 'config'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { Config } from 'src/enums/config.enum'

export class PhotoUrlHelper {
  private static baseUrl = config.get<string>(Config.HTTP_BASEURL_PHOTO)

  static cover(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/cover/${uuid}.jpg`
  }

  static card(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/card/${uuid}.webp`
  }

  static thumbnail(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/thumbnail/${uuid}.webp`
  }

  static preview(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/preview/${uuid}.webp`
  }

  static profileWebp(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/profiles/${uuid}.webp`
  }

  static profileJpg(uuid: string = DEFAULT_UUID) {
    return `${PhotoUrlHelper.baseUrl}/photos/profiles/${uuid}.jpg`
  }
}
