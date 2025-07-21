import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { GalleryAlbumPhotoModel } from '../dto/gallery-album-photo.model'
import { GalleryPhotoRejectionDto } from '../dto/gallery-photo-rejection.dto'
import { UuidParamDto } from '../dto/uuid-param.dto'
import { UuidsBodyDto } from '../dto/uuids-body.dto'
import { GalleryPhotoMoveDto } from '../dto/gallery-photo-move.dto'
import { GalleryPhotoService } from './gallery-photo.service'

@Controller({ path: 'gallery/photos', version: '1' })
@ApiTags('GalleryPhotoV1')
export class GalleryPhotoV1Controller {
  constructor(private readonly galleryPhotoService: GalleryPhotoService) {}

  @Get(':id')
  @AuthGroups('nudch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: GalleryAlbumPhotoModel })
  async getGalleryPhotoInfo(@Param() { id }: UuidParamDto): Promise<GalleryAlbumPhotoModel> {
    const photo = await this.galleryPhotoService.findById(id)
    if (!photo) throw new NotFoundException()
    return GalleryAlbumPhotoModel.fromEntity(photo)
  }

  @Post('reprocess')
  @AuthGroups('nudch')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiAcceptedResponse()
  async reprocessGalleryPhotos(@Body() { ids }: UuidsBodyDto) {
    await Promise.all(ids.map((id) => this.galleryPhotoService.reprocess(id)))
  }

  @Post(':id/reprocess')
  @AuthGroups('nudch')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiAcceptedResponse()
  async reprocessGalleryPhoto(@Param() { id }: UuidParamDto) {
    await this.galleryPhotoService.reprocess(id)
  }

  @Patch('move')
  @AuthGroups('pr')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  async moveGalleryPhotos(@Body() { ids, albumId }: GalleryPhotoMoveDto) {
    await this.galleryPhotoService.movePhotos(ids, albumId)
  }

  @Patch(':id/approve')
  @AuthGroups('pr', 'photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  async approveGalleryPhoto(@Param() { id }: UuidParamDto, @UserCtx() user: User) {
    await this.galleryPhotoService.approvePhoto(id, ProfileIdModel.fromObjectIdOrThrow(user.id))
  }

  @Patch(':id/reject')
  @AuthGroups('pr', 'photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  async rejectGalleryPhoto(
    @Param() { id }: UuidParamDto,
    @Body() { reason, message }: GalleryPhotoRejectionDto,
    @UserCtx() user: User,
  ) {
    await this.galleryPhotoService.rejectPhoto(id, ProfileIdModel.fromObjectIdOrThrow(user.id), reason, message)
  }

  @Patch(':id/reset-approvals')
  @AuthGroups('it', 'pr')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuditLog(GalleryPhotoV1Controller.prototype.resetGalleryPhotoApprovals.name)
  async resetGalleryPhotoApprovals(@Param() { id }: UuidParamDto) {
    await this.galleryPhotoService.resetApprovals(id)
  }

  @Delete(':id')
  @AuthGroups('pr')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuditLog(GalleryPhotoV1Controller.prototype.deleteGalleryPhoto.name)
  async deleteGalleryPhoto(@Param() { id }: UuidParamDto) {
    await this.galleryPhotoService.deletePhoto(id)
  }
}
