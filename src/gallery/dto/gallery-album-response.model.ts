import { ApiProperty } from '@nestjs/swagger'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

export class GalleryAlbumResponseModel {
  constructor(model: Partial<GalleryAlbumResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  rank: number

  @ApiProperty()
  cover: string

  @ApiProperty()
  published: boolean

  @ApiProperty()
  publishedAt: string

  static fromModel(model: GalleryAlbumModel) {
    return new GalleryAlbumResponseModel({
      id: model._id,
      title: model.title,
      rank: model.rank,
      cover: model.cover,
      published: model.published,
      publishedAt: model.published_at?.getTime()?.toString(),
    })
  }
}
