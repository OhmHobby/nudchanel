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
}
