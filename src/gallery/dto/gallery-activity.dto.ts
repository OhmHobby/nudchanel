import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { GalleryTagEntity } from 'src/entities/gallery-tag.entity'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'

export class GalleryActivityDto {
  constructor(dto?: Partial<GalleryActivityDto>) {
    Object.assign(this, dto)
  }

  @IsString()
  @Type(() => String)
  @ApiProperty()
  title: string

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  time: Date

  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiPropertyOptional()
  description?: string

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

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  @ApiPropertyOptional()
  tags: string[] = []

  toModel(): GalleryActivityModel {
    return new GalleryActivityModel({
      title: this.title,
      time: this.time,
      description: this.description,
      cover: this.cover,
      published: this.published,
      published_at: this.publishedAt ?? new Date(),
      tags: this.tags,
    })
  }

  toEntity(): GalleryActivityEntity {
    return new GalleryActivityEntity({
      title: this.title,
      time: this.time,
      description: this.description,
      cover: this.cover,
      published: this.published,
      publishedAt: this.publishedAt,
      tags: this.tags.map((tag) => new GalleryTagEntity({ title: tag })),
    })
  }
}
