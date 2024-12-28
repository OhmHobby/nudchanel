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
import { ActivityIdQueryDto } from '../dto/activity-id-query.dto'
import { AlbumIdDto } from '../dto/album-id.dto'
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
    @Query() { activityId, all }: ActivityIdQueryDto,
  ): Promise<GalleryAlbumResponseModel[]> {
    const albums = await this.galleryAlbumService.findByActivity(activityId, all)
    return albums.map(GalleryAlbumResponseModel.fromModel)
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
    const album = await this.galleryAlbumService.create(activityId, body.toModel())
    return GalleryAlbumResponseModel.fromModel(album)
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
    return albums.map(GalleryAlbumResponseModel.fromModel)
  }

  @Get(':albumId')
  @ApiOkResponse({ type: GalleryAlbumResponseModel })
  async getGalleryAlbumById(@Param() { albumId }: AlbumIdDto): Promise<GalleryAlbumResponseModel> {
    const album = await this.galleryAlbumService.findById(albumId)
    if (!album) throw new NotFoundException()
    return GalleryAlbumResponseModel.fromModel(album)
  }

  @Put(':albumId')
  @ApiOkResponse({ type: GalleryAlbumResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('pr')
  @AuditLog(GalleryAlbumV1Controller.prototype.updateGalleryAlbumById.name)
  async updateGalleryAlbumById(
    @Param() { albumId }: AlbumIdDto,
    @Body() body: GalleryAlbumDto,
  ): Promise<GalleryAlbumResponseModel> {
    const album = await this.galleryAlbumService.update(albumId, body.toModel())
    if (!album) throw new NotFoundException()
    return GalleryAlbumResponseModel.fromModel(album)
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
