import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsDate, IsOptional, IsString, Validate } from 'class-validator'
import { MINIMUM_PHOTO_RESOLUTION_MP } from 'src/constants/gallery.constant'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { ValidBeforeAfterDate } from 'src/validators/valid-before-after-date'
import { ValidBeforeAfterDateOption } from 'src/validators/valid-before-after-date-option.type'
import { ValidPath } from 'src/validators/valid-path'

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

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(ValidPath, [/^\/\d{4}\/.+/])
  uploadDirectory?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  watermarkPreset?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @Validate(ValidBeforeAfterDate, [
    (dto: GalleryAlbumDto) => dto.takenBefore,
    { minDay: -1, maxDay: 0 } as ValidBeforeAfterDateOption,
  ])
  takenAfter?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @Validate(ValidBeforeAfterDate, [
    (dto: GalleryAlbumDto) => dto.takenAfter,
    { minDay: 0, maxDay: 1 } as ValidBeforeAfterDateOption,
  ])
  takenBefore?: Date

  toEntity(): GalleryAlbumEntity {
    return new GalleryAlbumEntity({
      title: this.title,
      cover: this.cover,
      published: this.published,
      publishedAt: this.publishedAt,
      uploadDirectory: this.uploadDirectory,
      minimumResolutionMp: this.uploadDirectory ? MINIMUM_PHOTO_RESOLUTION_MP : undefined,
      watermarkPreset: this.watermarkPreset,
      takenAfter: this.takenAfter,
      takenBefore: this.takenBefore,
    })
  }
}
