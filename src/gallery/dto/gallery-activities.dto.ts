import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsInt, IsOptional, Max, MaxLength } from 'class-validator'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10

export class GalleryActivitesDto {
  @IsInt()
  @IsOptional()
  @Max(MAX_LIMIT)
  @Type(() => Number)
  @ApiPropertyOptional({ default: DEFAULT_LIMIT, maximum: MAX_LIMIT })
  limit: number = DEFAULT_LIMIT

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(+value) : undefined))
  @ApiPropertyOptional({ type: 'string', description: 'Before timestamp ms' })
  before?: Date

  @IsOptional()
  @ApiPropertyOptional()
  @MaxLength(MAX_LIMIT)
  search?: string

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  year?: number
}
