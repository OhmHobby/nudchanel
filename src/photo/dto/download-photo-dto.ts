import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'

export class DownloadPhotoDto {
  @IsUUID()
  @ApiProperty({ example: DEFAULT_UUID })
  uuid: string
}
