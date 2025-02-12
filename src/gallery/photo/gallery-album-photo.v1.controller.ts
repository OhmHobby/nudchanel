import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { AlbumIdDto } from '../dto/album-id.dto'
import { GalleryAlbumPhotoImportDto } from '../dto/gallery-album-photo-import.dto'
import { GalleryAlbumPhotoUploadFileDto } from '../dto/gallery-album-photo-upload-file.dto'
import { GalleryAlbumPhotoModel } from '../dto/gallery-album-photo.model'
import { GalleryAlbumPhotosModel } from '../dto/gallery-album-photos.model'
import { GalleryUploadPhotosQueryDto } from '../dto/gallery-upload-photos-query.dto'
import { GalleryAlbumPhotoService } from './gallery-album-photo.service'

@Controller({ path: 'gallery/albums/:albumId/photos', version: '1' })
@ApiTags('GalleryAlbumPhotoV1')
export class GalleryAlbumPhotoV1Controller {
  constructor(private readonly galleryAlbumPhotoService: GalleryAlbumPhotoService) {}

  @Get()
  @ApiOkResponse({ type: GalleryAlbumPhotosModel })
  async getGalleryAlbumPhotos(@Param() { albumId }: AlbumIdDto): Promise<GalleryAlbumPhotosModel> {
    const v1Photos = await this.galleryAlbumPhotoService.getPhotoV1ProcessedPhotos(albumId)
    return v1Photos
  }

  @Get('uploads')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: GalleryAlbumPhotosModel })
  async getUploadedGalleryAlbumPhotos(
    @Param() { albumId }: AlbumIdDto,
    @Query() { takenBy, state, nextState }: GalleryUploadPhotosQueryDto,
  ): Promise<GalleryAlbumPhotosModel> {
    const [contributors, photos] = await Promise.all([
      this.galleryAlbumPhotoService.getUploadContributors(albumId),
      this.galleryAlbumPhotoService.getUploadPhotos(
        albumId,
        ObjectIdUuidConverter.toUuid(takenBy),
        state ?? GalleryPhotoEntity.stateFromNextState(nextState),
      ),
    ])
    return new GalleryAlbumPhotosModel({ contributors, photos })
  }

  @Post('uploads')
  @AuthGroups('nudch')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiBody({ type: GalleryAlbumPhotoUploadFileDto })
  @ApiCreatedResponse({ type: GalleryAlbumPhotoModel })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGalleryAlbumPhoto(
    @Param() { albumId }: AlbumIdDto,
    @UploadedFile() file: Express.Multer.File,
    @UserCtx() user: User,
  ): Promise<GalleryAlbumPhotoModel> {
    const photo = await this.galleryAlbumPhotoService.uploadFile(
      albumId,
      ProfileIdModel.fromObjectIdOrThrow(user.id),
      file.originalname,
      file.buffer,
    )
    return GalleryAlbumPhotoModel.fromEntity(photo)
  }

  @Post('imports')
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: [GalleryAlbumPhotoModel] })
  async importGalleryAlbumPhotos(
    @Param() { albumId }: AlbumIdDto,
    @Body() { directory, takenBy }: GalleryAlbumPhotoImportDto,
    @UserCtx() user: User,
  ): Promise<GalleryAlbumPhotoModel[]> {
    const photos = await this.galleryAlbumPhotoService.importFiles(
      albumId,
      directory,
      ProfileIdModel.fromObjectIdOrThrow(user.id),
      ProfileIdModel.fromObjectIdOrThrow(takenBy),
    )
    return photos.map((photo) => GalleryAlbumPhotoModel.fromEntity(photo))
  }
}
