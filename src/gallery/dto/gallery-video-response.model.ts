import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IYouTubeVideo } from 'src/google/interfaces/youtube-video.interface'

export class GalleryVideoResponseModel implements IYouTubeVideo {
  constructor(model: Partial<GalleryVideoResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty({ type: String })
  @Expose()
  get youtubeId() {
    return this.id
  }

  @ApiProperty()
  title: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  url: string

  @ApiProperty()
  published: boolean

  @ApiProperty({ type: String, format: 'date-time' })
  publishedAt: Date
}
