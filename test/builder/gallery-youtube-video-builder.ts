import { IYouTubeVideo } from 'src/google/interfaces/youtube-video.interface'

export class GalleryYouTubeVideoBuilder {
  private readonly youtubeVideo: IYouTubeVideo

  constructor() {
    this.youtubeVideo = {
      id: 'Lm4iOuDAubs',
      title: 'Title',
      cover: '',
      url: '',
      published: false,
      publishedAt: new Date(),
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
