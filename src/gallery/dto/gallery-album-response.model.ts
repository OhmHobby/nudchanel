import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
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

  @ApiProperty({ type: String, format: 'date-time' })
  publishedAt: Date

  @ApiPropertyOptional({ type: () => GalleryActivityResponseModel })
  activity?: GalleryActivityResponseModel

  static fromEntity(entity: GalleryAlbumEntity) {
    return new GalleryAlbumResponseModel({
      id: entity.id,
      title: entity.title,
      rank: entity.rank,
      cover: entity.cover ?? undefined,
      published: entity.published,
      publishedAt: entity.publishedAt ?? undefined,
      activity: entity.activity ? GalleryActivityResponseModel.fromEntity(entity.activity) : undefined,
    })
  }
}
