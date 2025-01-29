import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { IYouTubeVideo } from 'src/google/interfaces/youtube-video.interface'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
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

  @ApiProperty({ type: String, format: 'date-time' })
  publishedAt: Date

  @ApiProperty({ type: [String] })
  tags: string[]

  @ApiPropertyOptional({ type: () => [GalleryAlbumResponseModel] })
  albums?: GalleryAlbumResponseModel[]

  @ApiPropertyOptional({ type: () => [GalleryVideoResponseModel] })
  videos?: GalleryVideoResponseModel[]

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

  withAlbums(albums: GalleryAlbumEntity[]) {
    this.albums = albums.map((album) => GalleryAlbumResponseModel.fromEntity(album))
    return this
  }

  withVideos(videos: IYouTubeVideo[]) {
    this.videos = videos.map((video) => new GalleryVideoResponseModel(video))
    return this
  }
}
