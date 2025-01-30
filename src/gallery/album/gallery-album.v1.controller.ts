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
import { User } from '@nudchannel/auth'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ActivityIdQueryDto } from '../dto/activity-id-query.dto'
import { AlbumIdDto } from '../dto/album-id.dto'
import { AlbumsActivityIdQueryDto } from '../dto/albums-activity-id-query.dto'
import { GalleryAlbumRankDto } from '../dto/gallery-album-rank.dto'
import { GalleryAlbumResponseModel } from '../dto/gallery-album-response.model'
import { GalleryAlbumDto } from '../dto/gallery-album.dto'
import { GalleryAlbumService } from './gallery-album.service'

@Controller({ path: 'gallery/albums', version: '1' })
@ApiTags('GalleryAlbumV1')
export class GalleryAlbumV1Controller {
  constructor(private readonly galleryAlbumService: GalleryAlbumService) {}

  @Get()
  @ApiOkResponse({ type: [GalleryAlbumResponseModel] })
  async getGalleryAlbumsByActivityId(
    @Query() { activityId, all }: AlbumsActivityIdQueryDto,
  ): Promise<GalleryAlbumResponseModel[]> {
    const albums = await this.galleryAlbumService.findByActivity(activityId, all)
    return albums.map((album) => GalleryAlbumResponseModel.fromEntity(album))
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: GalleryAlbumResponseModel })
  @AuthGroups('pr')
  @AuditLog(GalleryAlbumV1Controller.prototype.createGalleryAlbum.name)
  async createGalleryAlbum(
    @Query() { activityId }: ActivityIdQueryDto,
    @Body() body: GalleryAlbumDto,
  ): Promise<GalleryAlbumResponseModel> {
    const album = await this.galleryAlbumService.create(activityId, body.toEntity())
    return GalleryAlbumResponseModel.fromEntity(album)
  }

  @Put('rank')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @ApiOkResponse({ type: [GalleryAlbumResponseModel] })
  @AuditLog(GalleryAlbumV1Controller.prototype.rankGalleryAlbum.name)
  async rankGalleryAlbum(
    @Query() { activityId }: ActivityIdQueryDto,
    @Body() { albumIds }: GalleryAlbumRankDto,
  ): Promise<GalleryAlbumResponseModel[]> {
    const albums = await this.galleryAlbumService.rankAlbums(activityId, albumIds)
    return albums.map((album) => GalleryAlbumResponseModel.fromEntity(album))
  }

  @Get(':albumId')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: GalleryAlbumResponseModel })
  async getGalleryAlbumById(
    @Param() { albumId }: AlbumIdDto,
    @UserCtx() user: User,
  ): Promise<GalleryAlbumResponseModel> {
    const album = await this.galleryAlbumService.findById(albumId)
    if (!album) throw new NotFoundException()
    const response = GalleryAlbumResponseModel.fromEntity(album)
    if (user.isSignedIn()) {
      const uploadInfo = await this.galleryAlbumService.findUploadTaskInfo(albumId)
      response.withUploadInfo(uploadInfo)
    }
    return response
  }

  @Put(':albumId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @AuditLog(GalleryAlbumV1Controller.prototype.updateGalleryAlbumById.name)
  async updateGalleryAlbumById(@Param() { albumId }: AlbumIdDto, @Body() body: GalleryAlbumDto): Promise<void> {
    const album = await this.galleryAlbumService.update(albumId, body.toEntity())
    if (!album) throw new NotFoundException()
  }

  @Delete(':albumId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ type: GalleryAlbumResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @AuditLog(GalleryAlbumV1Controller.prototype.deleteGalleryAlbumById.name)
  async deleteGalleryAlbumById(@Param() { albumId }: AlbumIdDto): Promise<void> {
    await this.galleryAlbumService.remove(albumId)
  }
}
