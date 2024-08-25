import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'

export class GalleryQueryDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Validate(IsForbiddenField, ['nudch'])
  @ApiPropertyOptional()
  all?: boolean
}
