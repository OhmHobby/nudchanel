import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { GalleryAlbumResponseModel } from './gallery-album-response.model'
import { GalleryVideoResponseModel } from './gallery-video-response.model'

export class GalleryActivityResponseModel {
  constructor(model?: Partial<GalleryActivityResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiPropertyOptional()
  description?: string

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
  time: Date

  @ApiProperty()
  published: boolean

  @ApiProperty()
  publishedAt: Date

  @ApiProperty({ type: [String] })
  tags: string[]

  @ApiPropertyOptional({ type: () => [GalleryAlbumResponseModel] })
  albums?: GalleryAlbumResponseModel[]

  @ApiPropertyOptional({ type: () => [GalleryVideoResponseModel] })
  videos?: GalleryVideoResponseModel[]

  static fromModel(model: GalleryActivityModel) {
    return new GalleryActivityResponseModel({
      id: model._id,
      title: model.title,
      description: model.description,
      time: model.time,
      cover: model.cover,
      tags: model.tags,
      published: model.published,
      publishedAt: model.published_at,
    })
  }

  static fromEntity(entity: GalleryActivityEntity) {
    return new GalleryActivityResponseModel({
      id: entity.id,
      title: entity.title,
      description: entity.description ?? undefined,
      time: entity.time,
      cover: entity.cover ?? undefined,
      tags: entity.tags.map((el) => el.title),
      published: entity.published,
      publishedAt: entity.publishedAt ?? undefined,
    })
  }

  withAlbums(albums: GalleryAlbumModel[]) {
    this.albums = albums.map((album) => GalleryAlbumResponseModel.fromModel(album))
    return this
  }

  withVideos(videos: GalleryVideoResponseModel[]) {
    this.videos = videos
    return this
  }
}
