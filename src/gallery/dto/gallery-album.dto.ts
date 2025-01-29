import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'

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
  @IsOptional()
  publishedAt: Date

  toEntity(): GalleryAlbumEntity {
    return new GalleryAlbumEntity({
      title: this.title,
      cover: this.cover,
      published: this.published,
      publishedAt: this.publishedAt,
    })
  }
}
