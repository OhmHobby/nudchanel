import { Types } from 'mongoose'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'

export class YouTubeVideoBuilder {
  private readonly youtubeVideo: YouTubeVideoModel

  constructor() {
    this.youtubeVideo = new YouTubeVideoModel()
    this.youtubeVideo._id = new Types.ObjectId('5fd2dcef2122ed92e8f1913a')
    this.youtubeVideo.youtube = 'Lm4iOuDAubs'
  }

  build() {
    return this.youtubeVideo
  }
}
