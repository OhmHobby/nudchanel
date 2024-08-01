import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ActivityIdDto } from '../dto/activity-id.dto'
import { GalleryVideoResponseModel } from '../dto/gallery-video-response.model'
import { GalleryVideoService } from './gallery-video.service'

@Controller({ path: 'gallery/videos', version: '1' })
@ApiTags('GalleryVideoV1')
export class GalleryVideoV1Controller {
  constructor(private readonly galleryVideoService: GalleryVideoService) {}

  @Get(':activityId')
  @ApiOkResponse({ type: [GalleryVideoResponseModel] })
  async getGalleryVideosByActivityId(@Param() { activityId }: ActivityIdDto): Promise<GalleryVideoResponseModel[]> {
    const videos = await this.galleryVideoService.findByActivity(activityId)
    return videos.map((video) => new GalleryVideoResponseModel(video))
  }
}
