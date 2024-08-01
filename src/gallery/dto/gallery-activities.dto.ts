import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsInt, IsOptional, Max } from 'class-validator'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10

export class GalleryActivitesDto {
  @IsInt()
  @IsOptional()
  @Max(MAX_LIMIT)
  @Transform(({ value }) => +value)
  @ApiPropertyOptional({ default: DEFAULT_LIMIT, maximum: MAX_LIMIT })
  limit: number = DEFAULT_LIMIT

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(+value) : undefined))
  @ApiPropertyOptional({ type: 'string', description: 'Before timestamp ms' })
  before?: Date

  @IsOptional()
  @ApiPropertyOptional()
  search?: string
}
