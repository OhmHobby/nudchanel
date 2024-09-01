import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'

export interface IProcessPhotoParams {
  format: ImageFormat

  width?: number

  height?: number

  quality?: number

  fit: ImageFit

  watermark?: string

  heightRatio?: number

  widthRatio?: number
}
