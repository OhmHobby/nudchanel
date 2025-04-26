import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsUUID } from 'class-validator'

export class GalleryReportDto {
  constructor(base: Partial<GalleryReportDto>) {
    Object.assign(this, base)
  }

  @ApiProperty()
  @IsString()
  reason: string

  @ApiProperty()
  @IsUUID()
  photoId: string

  @ApiProperty()
  @IsUUID()
  albumId: string

  @ApiProperty()
  @IsEmail()
  email: string
}
