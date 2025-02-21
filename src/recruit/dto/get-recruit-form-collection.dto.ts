import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, Validate } from 'class-validator'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'

export class GetRecruitFormCollectionDto {
  @ApiPropertyOptional({ description: 'Query answers by applicantId' })
  @Validate(IsForbiddenField, ['nudch'])
  @IsOptional()
  applicantId?: string
}
