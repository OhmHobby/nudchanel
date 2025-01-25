import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { GalleryAlbumService } from '../album/gallery-album.service'
import { ActivityIdParamDto } from '../dto/activity-id-param.dto'
import { GalleryActivitesDto } from '../dto/gallery-activities.dto'
import { GalleryActivityResponseModel } from '../dto/gallery-activity-response.model'
import { GalleryActivityDto } from '../dto/gallery-activity.dto'
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
    return activities.map(GalleryActivityResponseModel.fromEntity)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: GalleryActivityResponseModel })
  @AuthGroups('pr')
  @AuditLog(GalleryActivityV1Controller.prototype.createGalleryActivity.name)
  async createGalleryActivity(@Body() body: GalleryActivityDto): Promise<GalleryActivityResponseModel> {
    const activity = await this.galleryActivityService.create(body.toEntity())
    return GalleryActivityResponseModel.fromEntity(activity)
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
    return GalleryActivityResponseModel.fromEntity(activity).withAlbums(albums).withVideos(videos)
  }

  @Put(':activityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @AuditLog(GalleryActivityV1Controller.prototype.updateGalleryActivityById.name)
  async updateGalleryActivityById(
    @Param() { activityId }: ActivityIdParamDto,
    @Body() body: GalleryActivityDto,
  ): Promise<void> {
    const result = await this.galleryActivityService.update(activityId, body.toEntity())
    if (!result) throw new NotFoundException()
  }

  @Delete(':activityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @AuditLog(GalleryActivityV1Controller.prototype.deleteGalleryActivityById.name)
  async deleteGalleryActivityById(@Param() { activityId }: ActivityIdParamDto): Promise<void> {
    const result = await this.galleryActivityService.remove(activityId)
    if (!result) throw new NotFoundException()
  }
}
