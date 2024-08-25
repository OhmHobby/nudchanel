import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ActivityIdQueryDto } from '../dto/activity-id-query.dto'
import { AlbumIdDto } from '../dto/album-id.dto'
import { GalleryAlbumResponseModel } from '../dto/gallery-album-response.model'
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

  @Get(':albumId')
  @ApiOkResponse({ type: GalleryAlbumResponseModel })
  async getGalleryAlbumById(@Param() { albumId }: AlbumIdDto): Promise<GalleryAlbumResponseModel> {
    const album = await this.galleryAlbumService.findById(albumId)
    if (!album) throw new NotFoundException()
    return GalleryAlbumResponseModel.fromModel(album)
  }
}
