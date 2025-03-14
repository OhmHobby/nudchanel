import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'

export class GalleryVideosDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  activityId: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @Validate(IsForbiddenField, ['nudch'])
  @ApiPropertyOptional()
  all?: boolean
}
