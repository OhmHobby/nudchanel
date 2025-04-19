import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { google } from 'googleapis'
import { Span } from 'nestjs-otel'
import { GoogleJwtClientService } from './google-jwt-client.service'
import { IYouTubeVideo } from './interfaces/youtube-video.interface'

@Injectable()
export class YouTubeService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly googleClientService: GoogleJwtClientService,
  ) {}

  @Span()
  async getYouTubeClient() {
    const client = await this.googleClientService.getClient()
    return google.youtube({
      version: 'v3',
      auth: client,
    })
  }

  @Span()
  async fetchVideo(id: string): Promise<IYouTubeVideo> {
    const service = await this.getYouTubeClient()
    const { data } = await service.videos.list({
      id: [id],
      part: ['snippet', 'status'],
    })
    const video = data.items?.at(0)
    return {
      id,
      title: video?.snippet?.title ?? '',
      cover: video?.snippet?.thumbnails?.maxres?.url ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      url: `https://youtu.be/${id}`,
      published: video?.status?.privacyStatus === 'public',
      publishedAt: new Date(video?.snippet?.publishedAt ?? new Date()),
    }
  }

  @Span()
  async getVideo(id: string): Promise<IYouTubeVideo> {
    const cacheKey = 'youtube:video:' + id
    const cached = await this.cacheManager.get<IYouTubeVideo>(cacheKey)
    if (cached?.id) {
      return {
        id: cached.id,
        title: cached.title,
        cover: cached.cover,
        url: cached.url,
        published: cached.published,
        publishedAt: new Date(cached.publishedAt),
      }
    } else {
      const video = await this.fetchVideo(id)
      await this.cacheManager.set(cacheKey, video)
      return video
    }
  }
}
