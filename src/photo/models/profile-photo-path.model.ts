import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { GetProfilePhotoDto } from '../dto/get-profile-photo-dto'
import { ProcessPhotoParams } from '../processor/process-photo-params'
import { PhotoPathHelper } from './photo-path.helper.model.abstract'
import { IPhotoPath } from './photo-path.interface'

export class ProfilePhotoPath extends PhotoPathHelper implements IPhotoPath {
  private prefix = 'minio://profiles/'

  private static readonly webpSize = 256

  private static readonly jpegSize = 128

  constructor(
    readonly uuid: string = DEFAULT_UUID,
    readonly format: ImageFormat = ImageFormat.webp,
  ) {
    super()
  }

  get mime() {
    return 'image/' + this.format
  }

  get filename() {
    return `${this.uuid}.${ProfilePhotoPath.formatToExt(this.format)}`
  }

  get path() {
    return `${this.prefix}${this.uuid}.${ProfilePhotoPath.formatToExt(this.format)}`
  }

  get size() {
    return this.format === ImageFormat.webp ? ProfilePhotoPath.webpSize : ProfilePhotoPath.jpegSize
  }

  buildProcessParams(params?: Partial<ProcessPhotoParams>) {
    return new ProcessPhotoParams({
      format: this.format,
      width: this.size,
      height: this.size,
      fit: ImageFit.cover,
      heightRatio: 0.1,
      ...params,
    })
  }

  static fromGetProfilePhotoDto({ uuid, ext }: GetProfilePhotoDto) {
    return new ProfilePhotoPath(uuid, ProfilePhotoPath.extToFormat(ext))
  }
}
