import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { AlbumPhotoUploadRule } from '../photo/rules/album-photo-upload-rule'
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

  @ApiPropertyOptional()
  uploadDirectory?: string

  @ApiPropertyOptional()
  watermarkPreset?: string

  @ApiPropertyOptional()
  takenAfter?: Date

  @ApiPropertyOptional()
  takenBefore?: Date

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
      uploadDirectory: entity.uploadDirectory || undefined,
      watermarkPreset: entity.watermarkPreset || undefined,
      takenAfter: entity.takenAfter || undefined,
      takenBefore: entity.takenBefore || undefined,
    })
  }

  withUploadInfo(model: UploadTaskModel | null) {
    if (model) {
      const rule = AlbumPhotoUploadRule.fromPattern(model.rules)
      this.uploadDirectory = this.uploadDirectory ?? model.src_directory
      this.watermarkPreset = this.watermarkPreset ?? rule.watermarkPreset
      this.takenAfter = this.takenAfter ?? rule.takenAfter?.toDate()
      this.takenBefore = this.takenBefore ?? rule.takenBefore?.toDate()
    }
    return this
  }
}
