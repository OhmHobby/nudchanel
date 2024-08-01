import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ActivityIdDto } from '../dto/activity-id.dto'
import { GalleryAlbumResponseModel } from '../dto/gallery-album-response.model'
import { GalleryAlbumService } from './gallery-album.service'

@Controller({ path: 'gallery/albums', version: '1' })
@ApiTags('GalleryAlbumV1')
export class GalleryAlbumV1Controller {
  constructor(private readonly galleryAlbumService: GalleryAlbumService) {}

  @Get(':activityId')
  @ApiOkResponse({})
  async getGalleryAlbumsByActivityId(@Param() { activityId }: ActivityIdDto): Promise<GalleryAlbumResponseModel[]> {
    const albums = await this.galleryAlbumService.findByActivity(activityId)
    return albums.map(GalleryAlbumResponseModel.fromModel)
  }
}
