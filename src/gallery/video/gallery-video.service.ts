import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { YouTubeService } from 'src/google/youtube.service'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { IGalleryYouTubeVideo } from '../interfaces/gallery-youtube-video.interface'
import { Span } from 'nestjs-otel'

@Injectable()
export class GalleryVideoService {
  constructor(
    private readonly youTubeService: YouTubeService,
    @InjectModel(YouTubeVideoModel)
    private readonly youtubeVideoModel: ReturnModelType<typeof YouTubeVideoModel>,
  ) {}

  @Span()
  async findByActivity(activityId: string, includesUnpublished = false): Promise<IGalleryYouTubeVideo[]> {
    const videos = await this.youtubeVideoModel.find({ activity: activityId }).exec()
    const youtubeVideos = await Promise.all(videos.map((el) => this.getGalleryYoutubeVideo(el)))
    return youtubeVideos.filter(({ published }) => includesUnpublished || published).sort(this.sortByPublishedAt)
  }

  @Span()
  async getGalleryYoutubeVideo(doc: Pick<YouTubeVideoModel, '_id' | 'youtube'>): Promise<IGalleryYouTubeVideo> {
    const youtube = await this.youTubeService.getVideo(doc.youtube)
    return {
      ...youtube,
      id: doc._id.toHexString(),
      youtubeId: youtube.id,
    }
  }

  @Span()
  sortByPublishedAt(a: Pick<IGalleryYouTubeVideo, 'publishedAt'>, b: Pick<IGalleryYouTubeVideo, 'publishedAt'>) {
    return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  }
}
