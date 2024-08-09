import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { GalleryActivityResponseModel } from './gallery-activity-response.model'

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

  @ApiPropertyOptional()
  cover?: string

  @ApiProperty({ type: String })
  @Expose()
  get coverUrl() {
    return PhotoUrlHelper.cover(this.cover)
  }

  @ApiProperty({ type: String })
  @Expose()
  get cardUrl() {
    return PhotoUrlHelper.card(this.cover)
  }

  @ApiProperty()
  published: boolean

  @ApiProperty()
  publishedAt: string

  @ApiPropertyOptional({ type: () => GalleryActivityResponseModel })
  activity?: GalleryActivityResponseModel

  static fromModel(model: GalleryAlbumModel) {
    const activity = model.activity as GalleryActivityModel
    return new GalleryAlbumResponseModel({
      id: model._id,
      title: model.title,
      rank: model.rank,
      cover: model.cover,
      published: model.published,
      publishedAt: model.published_at?.getTime()?.toString(),
      activity: activity?._id ? GalleryActivityResponseModel.fromModel(activity) : undefined,
    })
  }
}
