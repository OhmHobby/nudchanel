import { ImageFormat } from 'src/enums/image-format.enum'

export abstract class PhotoPathHelper {
  protected static extToFormat(ext: string): ImageFormat {
    if (ext === ImageFormat.webp) return ImageFormat.webp
    else if (ext === ImageFormat.png) return ImageFormat.png
    else return ImageFormat.jpeg
  }

  protected static formatToExt(format: ImageFormat): string {
    if (format === ImageFormat.webp) return 'webp'
    else if (format === ImageFormat.png) return 'png'
    else return 'jpg'
  }
}
