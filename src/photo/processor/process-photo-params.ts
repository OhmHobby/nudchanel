import config from 'config'
import { Config } from 'src/enums/config.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'

export class ProcessPhotoParams {
  constructor(object?: Partial<ProcessPhotoParams>) {
    Object.assign(this, object)
  }

  format = ImageFormat.jpeg

  width?: number

  height?: number

  quality = config.get<number>(Config.PHOTO_PROCESSOR_DEFAULT_QUALITY)

  fit = ImageFit.Inside

  watermark?: string
}
