import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ImportProfilePhotoDto {
  @ApiProperty()
  @IsString()
  directory: string

  @ApiProperty()
  @IsString()
  filename: string
}
