import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, IsUUID } from 'class-validator'

export class GalleryPhotoMoveDto {
  @ApiProperty({ type: String, isArray: true })
  @IsUUID(undefined, { each: true })
  @IsArray()
  ids: string[]

  @ApiProperty({ type: String })
  @IsString()
  albumId: string
}
