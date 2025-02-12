import { ApiProperty } from '@nestjs/swagger'
import { ProfileDetailResponseModel } from 'src/accounts/models/profile-detail.response.model'
import { GalleryAlbumPhotoModel } from './gallery-album-photo.model'

export class GalleryAlbumPhotosModel {
  constructor(model: Partial<GalleryAlbumPhotosModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({
    type: ProfileDetailResponseModel,
    isArray: true,
    description: 'Display all contributors regardless the taken by filter',
  })
  contributors: ProfileDetailResponseModel[]

  @ApiProperty({ type: GalleryAlbumPhotoModel, isArray: true })
  photos: GalleryAlbumPhotoModel[]
}
