import config from 'config'
import { Region, ResizeOptions } from 'sharp'
import { Config } from 'src/enums/config.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { IProcessPhotoParams } from './process-photo-params.interface'

export class ProcessPhotoParams implements IProcessPhotoParams {
  static readonly defaultCropRatio = 0.5

  constructor(object?: Partial<IProcessPhotoParams>) {
    Object.assign(this, object)
  }

  format = ImageFormat.jpeg

  width?: number

  height?: number

  quality = config.get<number>(Config.PHOTO_PROCESSOR_DEFAULT_QUALITY)

  fit = ImageFit.inside

  watermark?: string

  heightRatio = ProcessPhotoParams.defaultCropRatio

  widthRatio = ProcessPhotoParams.defaultCropRatio

  buildResizeOptions(): ResizeOptions {
    return {
      width: this.width,
      height: this.height,
      fit: this.fit,
      withoutEnlargement: true,
    }
  }

  buildPreExtractRegion(width: number = 0, height: number = 0): Region {
    if (!this.width || !this.height) return { width, height, top: 0, left: 0 }
    const isPortrait = width < height
    const targetRatio = this.width / this.height
    if (isPortrait) {
      const newWidth = width
      const newHeight = width * targetRatio
      const top = Math.floor((height - newHeight) * this.heightRatio)
      return { width: newWidth, height: newHeight, top, left: 0 }
    } else {
      const newWidth = height * targetRatio
      const newHeight = height
      const left = Math.floor((width - newWidth) * this.widthRatio)
      return { width: newWidth, height: newHeight, top: 0, left }
    }
  }
}
