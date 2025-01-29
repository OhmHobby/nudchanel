import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
export class YouTubeVideoBuilder {
  private readonly youtubeVideo: GalleryYouTubeVideoEntity

  constructor() {
    this.youtubeVideo = new GalleryYouTubeVideoEntity()
    this.youtubeVideo.id = 'Lm4iOuDAubs'
  }

  build() {
    return this.youtubeVideo
  }
}
