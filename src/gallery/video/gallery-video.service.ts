import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery-youtube-video.entity'
import { IYouTubeVideo } from 'src/google/interfaces/youtube-video.interface'
import { YouTubeService } from 'src/google/youtube.service'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class GalleryVideoService {
  constructor(
    private readonly youTubeService: YouTubeService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GalleryYouTubeVideoEntity)
    private readonly youtubeVideoRepository: Repository<GalleryYouTubeVideoEntity>,
  ) {}

  @Span()
  async findByActivity(activityId: string, includesUnpublished = false): Promise<IYouTubeVideo[]> {
    const videos = await this.youtubeVideoRepository.findBy({ activityId })
    const youtubeVideos = await Promise.all(videos.map((el) => this.youTubeService.getVideo(el.id)))
    return youtubeVideos.filter(({ published }) => includesUnpublished || published).sort(this.sortByPublishedAt)
  }

  create(activityId: string, youtubeId: string): Promise<IYouTubeVideo> {
    return this.dataSource.transaction(async (manager) => {
      const row = await manager.save(
        new GalleryYouTubeVideoEntity({
          id: youtubeId,
          activityId,
        }),
      )
      const youtubeVideo = await this.youTubeService.getVideo(row.id)
      return youtubeVideo
    })
  }

  async remove(id: string) {
    return await this.youtubeVideoRepository.delete({ id })
  }

  @Span()
  sortByPublishedAt(a: Pick<IYouTubeVideo, 'publishedAt'>, b: Pick<IYouTubeVideo, 'publishedAt'>) {
    return a.publishedAt.getTime() - b.publishedAt.getTime()
  }
}
