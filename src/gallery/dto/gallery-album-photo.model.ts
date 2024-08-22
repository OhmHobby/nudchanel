import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ProfileNameResponseModel } from 'src/accounts/models/profile-name.response.model'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'

export class GalleryAlbumPhotoModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  uuid: string

  @ApiProperty()
  width: number

  @ApiProperty()
  height: number

  @ApiProperty({ description: 'Color in hex' })
  color: string

  @ApiProperty({ type: String, description: 'Thumbnail URL' })
  @Expose()
  get thumbnail() {
    return PhotoUrlHelper.thumbnail(this.uuid)
  }

  @ApiProperty({ type: String, description: 'Preview URL' })
  @Expose()
  get preview() {
    return PhotoUrlHelper.preview(this.uuid)
  }

  @ApiPropertyOptional({ type: ProfileNameResponseModel })
  takenBy?: ProfileNameResponseModel

  constructor(model: Partial<GalleryAlbumPhotoModel>) {
    Object.assign(this, model)
  }
}
