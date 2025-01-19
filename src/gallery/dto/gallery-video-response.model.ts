import { ApiProperty } from '@nestjs/swagger'
import { IGalleryYouTubeVideo } from '../interfaces/gallery-youtube-video.interface'

export class GalleryVideoResponseModel implements IGalleryYouTubeVideo {
  constructor(model: Partial<GalleryVideoResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  youtubeId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  url: string

  @ApiProperty()
  published: boolean

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  publishedAt: string
}
