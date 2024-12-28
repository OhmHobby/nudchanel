import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'

export class GalleryVideoDto {
  constructor(dto?: Partial<GalleryVideoDto>) {
    Object.assign(this, dto)
  }

  @IsString()
  @ApiProperty()
  youtubeId: string

  toModel(): YouTubeVideoModel {
    return new YouTubeVideoModel({
      youtube: this.youtubeId,
    })
  }
}
