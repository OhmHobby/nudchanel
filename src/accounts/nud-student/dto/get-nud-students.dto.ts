import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, Validate } from 'class-validator'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'
import { transformProfileIdModel } from 'src/helpers/transform-profile-id-model'

export class GetNudStudentsDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(transformProfileIdModel)
  @Validate(IsForbiddenField, ['nudch'])
  profileId?: ProfileIdModel
}
