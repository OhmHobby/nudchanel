import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { transformProfileIdModel } from 'src/helpers/transform-profile-id-model'
import { ProfileIdModel } from '../models/profile-id.model'

export class ProfileIdDto {
  @ApiProperty({ type: String })
  @Transform(transformProfileIdModel)
  profileId: ProfileIdModel
}
