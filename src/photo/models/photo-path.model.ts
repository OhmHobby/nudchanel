import { ImageFormat } from 'src/enums/image-format.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { DownloadPhotoDto } from '../dto/download-photo-dto'
import { GetPhotoDto } from '../dto/get-photo-dto'
import { ProcessPhotoParams } from '../processor/process-photo-params'
import { PhotoPathHelper } from './photo-path.helper.model.abstract'
import { IPhotoPath } from './photo-path.interface'

export class PhotoPath extends PhotoPathHelper implements IPhotoPath {
  private prefix = 'webdav://webdev/photos'

  readonly format: ImageFormat

  constructor(
    readonly size: PhotoSize,
    readonly uuid: string,
    format?: ImageFormat,
  ) {
    super()
    this.format = format ?? this.sizeFormat
  }

  get sizeFormat() {
    return PhotoPath.sizeFormat(this.size)
  }

  get mime() {
    return 'image/' + this.format
  }

  get filename() {
    return `${this.uuid}.${PhotoPath.formatToExt(this.format)}`
  }

  get requestPath() {
    return this.buildFullPath(this.size, PhotoPath.formatToExt(this.format))
  }

  get sourcePath() {
    return this.buildFullPath(this.size)
  }

  get isRequestASource() {
    return this.requestPath === this.sourcePath
  }

  get processParams() {
    return new ProcessPhotoParams({
      format: this.format,
      width: this.size,
      height: this.size,
    })
  }

  nextFallback(): PhotoPath | undefined {
    if (this.size + +this.isRequestASource <= PhotoSize.thumbnail) return new PhotoPath(PhotoSize.thumbnail, this.uuid)
    else if (this.size + +this.isRequestASource <= PhotoSize.preview) return new PhotoPath(PhotoSize.preview, this.uuid)
    else return undefined
  }

  private buildFullPath(size: PhotoSize, ext?: string) {
    return `${this.prefix}/${PhotoSize[size]}/${this.uuid}.${ext ?? PhotoPath.formatToExt(PhotoPath.sizeFormat(size))}`
  }

  static fromGetPhotoDto({ size, uuid, ext }: GetPhotoDto) {
    return new PhotoPath(size, uuid, PhotoPath.extToFormat(ext))
  }

  static fromDownloadPhotoDto({ uuid }: DownloadPhotoDto) {
    return new PhotoPath(PhotoSize.preview, uuid, ImageFormat.jpeg)
  }

  private static sizeFormat(size) {
    switch (size) {
      case PhotoSize.preview:
      case PhotoSize.thumbnail:
        return ImageFormat.webp
      default:
        return ImageFormat.jpeg
    }
  }
}
