import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsUUID } from 'class-validator'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'

export class GetProfilePhotoDto {
  @IsUUID()
  @ApiProperty({ example: DEFAULT_UUID })
  uuid: string

  @ApiProperty({ example: 'webp' })
  @IsIn(['jpg', 'webp', 'png'])
  ext: string
}
