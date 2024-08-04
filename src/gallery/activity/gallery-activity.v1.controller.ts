import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GalleryAlbumService } from '../album/gallery-album.service'
import { ActivityIdDto } from '../dto/activity-id.dto'
import { GalleryActivitesDto } from '../dto/gallery-activities.dto'
import { GalleryActivityResponseModel } from '../dto/gallery-activity-response.model'
import { GalleryVideoService } from '../video/gallery-video.service'
import { GalleryActivityService } from './gallery-activity.service'

@Controller({ path: 'gallery/activities', version: '1' })
@ApiTags('GalleryActivityV1')
export class GalleryActivityV1Controller {
  constructor(
    private readonly galleryActivityService: GalleryActivityService,
    private readonly galleryAlbumService: GalleryAlbumService,
    private readonly galleryVideoService: GalleryVideoService,
  ) {}

  @Get()
  @ApiOkResponse({ type: [GalleryActivityResponseModel] })
  async findGalleryActivities(
    @Query() { limit, before, search, year }: GalleryActivitesDto,
  ): Promise<GalleryActivityResponseModel[]> {
    const activities = await this.galleryActivityService.findActivities(limit, before, year, search)
    return activities.map(GalleryActivityResponseModel.fromModel)
  }

  @Get(':activityId')
  @ApiOkResponse({ type: GalleryActivityResponseModel })
  async getGalleryActivityById(@Param() { activityId }: ActivityIdDto): Promise<GalleryActivityResponseModel> {
    const [activity, albums, videos] = await Promise.all([
      this.galleryActivityService.findById(activityId),
      this.galleryAlbumService.findByActivity(activityId),
      this.galleryVideoService.findByActivity(activityId),
    ])
    if (!activity) throw new NotFoundException()
    return GalleryActivityResponseModel.fromModel(activity).withAlbums(albums).withVideos(videos)
  }
}
