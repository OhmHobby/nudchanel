import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GalleryAlbumService } from '../album/gallery-album.service'
import { ActivityIdParamDto } from '../dto/activity-id-param.dto'
import { GalleryActivitesDto } from '../dto/gallery-activities.dto'
import { GalleryActivityResponseModel } from '../dto/gallery-activity-response.model'
import { GalleryQueryDto } from '../dto/gallery-query.dto'
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
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [GalleryActivityResponseModel] })
  async findGalleryActivities(
    @Query() { limit, before, search, year, all: showAll }: GalleryActivitesDto,
  ): Promise<GalleryActivityResponseModel[]> {
    const activities = await this.galleryActivityService.findActivities(limit, before, year, search, showAll)
    return activities.map(GalleryActivityResponseModel.fromModel)
  }

  @Get(':activityId')
  @ApiOkResponse({ type: GalleryActivityResponseModel })
  async getGalleryActivityById(
    @Param() { activityId }: ActivityIdParamDto,
    @Query() { all }: GalleryQueryDto,
  ): Promise<GalleryActivityResponseModel> {
    const [activity, albums, videos] = await Promise.all([
      this.galleryActivityService.findById(activityId),
      this.galleryAlbumService.findByActivity(activityId, all),
      this.galleryVideoService.findByActivity(activityId, all),
    ])
    if (!activity) throw new NotFoundException()
    return GalleryActivityResponseModel.fromModel(activity).withAlbums(albums).withVideos(videos)
  }
}
