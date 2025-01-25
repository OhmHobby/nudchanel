import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
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

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  publishedAt: Date

  @ApiPropertyOptional({ type: () => GalleryActivityResponseModel })
  activity?: GalleryActivityResponseModel

  static fromModel(model: GalleryAlbumModel, activity?: GalleryActivityEntity) {
    return new GalleryAlbumResponseModel({
      id: model._id,
      title: model.title,
      rank: model.rank,
      cover: model.cover,
      published: model.published,
      publishedAt: model.published_at,
      activity: activity ? GalleryActivityResponseModel.fromEntity(activity) : undefined,
    })
  }
}
