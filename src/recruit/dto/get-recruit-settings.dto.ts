import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'

export class GetRecruitSettingsDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Validate(IsForbiddenField, ['head'])
  @ApiPropertyOptional()
  all?: boolean
}
