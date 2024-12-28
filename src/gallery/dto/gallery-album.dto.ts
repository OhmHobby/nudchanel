import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

export class GalleryAlbumDto {
  constructor(dto?: Partial<GalleryAlbumDto>) {
    Object.assign(this, dto)
  }

  @IsString()
  @Type(() => String)
  @ApiProperty()
  title: string

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiPropertyOptional()
  cover?: string

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ApiPropertyOptional()
  published: boolean = false

  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional()
  publishedAt: Date = new Date()

  toModel(): GalleryAlbumModel {
    return new GalleryAlbumModel({
      title: this.title,
      cover: this.cover,
      published: this.published,
      published_at: this.publishedAt,
    })
  }
}
