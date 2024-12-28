import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common'
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
import { ActivityIdQueryDto } from '../dto/activity-id-query.dto'
import { GalleryQueryDto } from '../dto/gallery-query.dto'
import { GalleryVideoResponseModel } from '../dto/gallery-video-response.model'
import { GalleryVideoDto } from '../dto/gallery-video.dto'
import { VideoIdParamDto } from '../dto/video-id-param.dto'
import { GalleryVideoService } from './gallery-video.service'

@Controller({ path: 'gallery/videos', version: '1' })
@ApiTags('GalleryVideoV1')
export class GalleryVideoV1Controller {
  constructor(private readonly galleryVideoService: GalleryVideoService) {}

  @Get()
  @ApiOkResponse({ type: [GalleryVideoResponseModel] })
  async getGalleryVideosByActivityId(
    @Query() { all, activityId }: GalleryQueryDto & ActivityIdQueryDto,
  ): Promise<GalleryVideoResponseModel[]> {
    const videos = await this.galleryVideoService.findByActivity(activityId, all)
    return videos.map((video) => new GalleryVideoResponseModel(video))
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: GalleryVideoResponseModel })
  @AuthGroups('pr')
  @AuditLog(GalleryVideoV1Controller.prototype.createGalleryVideo.name)
  async createGalleryVideo(
    @Query() { activityId }: ActivityIdQueryDto,
    @Body() body: GalleryVideoDto,
  ): Promise<GalleryVideoResponseModel> {
    const video = await this.galleryVideoService.create(activityId, body.toModel())
    return new GalleryVideoResponseModel(video)
  }

  @Delete(':videoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuthGroups('pr')
  @AuditLog(GalleryVideoV1Controller.prototype.deleteGalleryVideo.name)
  async deleteGalleryVideo(@Param() { videoId }: VideoIdParamDto): Promise<void> {
    await this.galleryVideoService.remove(videoId)
  }
}
