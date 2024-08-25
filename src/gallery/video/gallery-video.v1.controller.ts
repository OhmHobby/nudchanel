import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ActivityIdParamDto } from '../dto/activity-id-param.dto'
import { GalleryQueryDto } from '../dto/gallery-query.dto'
import { GalleryVideoResponseModel } from '../dto/gallery-video-response.model'
import { GalleryVideoService } from './gallery-video.service'

@Controller({ path: 'gallery/videos', version: '1' })
@ApiTags('GalleryVideoV1')
export class GalleryVideoV1Controller {
  constructor(private readonly galleryVideoService: GalleryVideoService) {}

  @Get(':activityId')
  @ApiOkResponse({ type: [GalleryVideoResponseModel] })
  async getGalleryVideosByActivityId(
    @Param() { activityId }: ActivityIdParamDto,
    @Query() { all }: GalleryQueryDto,
  ): Promise<GalleryVideoResponseModel[]> {
    const videos = await this.galleryVideoService.findByActivity(activityId, all)
    return videos.map((video) => new GalleryVideoResponseModel(video))
  }
}
