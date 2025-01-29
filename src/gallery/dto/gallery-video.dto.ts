import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GalleryVideoDto {
  constructor(dto?: Partial<GalleryVideoDto>) {
    Object.assign(this, dto)
  }

  @IsString()
  @ApiProperty()
  youtubeId: string
}
