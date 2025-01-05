import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'
export class AlbumsActivityIdQueryDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  activityId: string

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Validate(IsForbiddenField, ['nudch'])
  @ApiPropertyOptional()
  all?: boolean
}
