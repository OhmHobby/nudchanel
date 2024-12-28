import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsString } from 'class-validator'

export class GalleryAlbumRankDto {
  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  albumIds: string[]
}
