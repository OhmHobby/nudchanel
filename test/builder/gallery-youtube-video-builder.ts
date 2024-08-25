import { IGalleryYouTubeVideo } from 'src/gallery/interfaces/gallery-youtube-video.interface'

export class GalleryYouTubeVideoBuilder {
  private readonly youtubeVideo: IGalleryYouTubeVideo

  constructor() {
    this.youtubeVideo = {
      id: '5fd2dcef2122ed92e8f1913a',
      title: 'Title',
      cover: '',
      url: '',
      published: false,
      publishedAt: '',
      youtubeId: 'Lm4iOuDAubs',
    }
  }

  withId(id: string) {
    this.youtubeVideo.id = id
    return this
  }

  withPublished(published: boolean) {
    this.youtubeVideo.published = published
    return this
  }

  build() {
    return this.youtubeVideo
  }
}
