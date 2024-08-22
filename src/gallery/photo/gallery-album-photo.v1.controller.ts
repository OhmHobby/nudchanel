import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AlbumIdDto } from '../dto/album-id.dto'
import { GalleryAlbumPhotosModel } from '../dto/gallery-album-photos.model'
import { GalleryAlbumPhotoService } from './gallery-album-photo.service'

@Controller({ path: 'gallery/albums/:albumId/photos', version: '1' })
@ApiTags('GalleryAlbumPhotoV1')
export class GalleryAlbumPhotoV1Controller {
  constructor(private readonly galleryAlbumPhotoService: GalleryAlbumPhotoService) {}

  @Get()
  @ApiOkResponse({ type: GalleryAlbumPhotosModel })
  async getGalleryAlbumPhotos(@Param() { albumId }: AlbumIdDto): Promise<GalleryAlbumPhotosModel> {
    const v1Photos = await this.galleryAlbumPhotoService.getPhotoV1ProcessedPhotos(albumId)
    return new GalleryAlbumPhotosModel({ photos: v1Photos })
  }
}
