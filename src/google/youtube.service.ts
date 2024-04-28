import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { google } from 'googleapis'
import { GoogleJwtClientService } from './google-jwt-client.service'
import { IYouTubeVideo } from './interfaces/youtube-video.interface'

@Injectable()
export class YouTubeService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly googleClientService: GoogleJwtClientService,
  ) {}

  async getYouTubeClient() {
    const client = await this.googleClientService.getClient()
    return google.youtube({
      version: 'v3',
      auth: client,
    })
  }

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
      publishedAt: video?.snippet?.publishedAt ?? new Date().toISOString(),
    }
  }

  async getVideo(id: string): Promise<IYouTubeVideo> {
    const cacheKey = 'youtube:video:' + id
    return await this.cacheManager.wrap(cacheKey, () => this.fetchVideo(id))
  }
}
