import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'

export class GetRecruitRoleDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @Validate(IsForbiddenField, ['nudch'])
  @ApiPropertyOptional()
  all?: boolean
}
