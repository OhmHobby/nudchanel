import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator'
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
  publishedAt: Date = new Date()

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
      published_at: this.publishedAt,
      tags: this.tags,
    })
  }
}
