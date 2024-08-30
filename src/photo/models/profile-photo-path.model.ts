import { ImageFormat } from 'src/enums/image-format.enum'
import { GetProfilePhotoDto } from '../dto/get-profile-photo-dto'
import { PhotoPathHelper } from './photo-path.helper.model.abstract'
import { IPhotoPath } from './photo-path.interface'

export class ProfilePhotoPath extends PhotoPathHelper implements IPhotoPath {
  private prefix = 'minio://profiles'

  constructor(
    readonly uuid: string,
    readonly format: ImageFormat,
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
    return `${this.prefix}/${this.uuid}.${ProfilePhotoPath.formatToExt(this.format)}`
  }

  static fromGetProfilePhotoDto({ uuid, ext }: GetProfilePhotoDto) {
    return new ProfilePhotoPath(uuid, ProfilePhotoPath.extToFormat(ext))
  }
}
