import config from 'config'
import { Config } from 'src/enums/config.enum'

export class PhotoUrlHelper {
  private static defaultUuid = '00000000-0000-0000-0000-000000000000'

  private static baseUrl = config.get<string>(Config.HTTP_BASEURL_PHOTO)

  static cover(uuid: string = PhotoUrlHelper.defaultUuid) {
    return `${PhotoUrlHelper.baseUrl}/photos/cover/${uuid}.jpg`
  }

  static card(uuid: string = PhotoUrlHelper.defaultUuid) {
    return `${PhotoUrlHelper.baseUrl}/photos/card/${uuid}.webp`
  }
}
