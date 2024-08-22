import { ApiProperty } from '@nestjs/swagger'
import { GalleryAlbumPhotoModel } from './gallery-album-photo.model'

export class GalleryAlbumPhotosModel {
  constructor(model: Partial<GalleryAlbumPhotosModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ type: GalleryAlbumPhotoModel, isArray: true })
  photos: GalleryAlbumPhotoModel[]
}
