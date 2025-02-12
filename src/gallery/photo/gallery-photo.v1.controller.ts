import { Body, Controller, Param, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { GalleryPhotoRejectionDto } from '../dto/gallery-photo-rejection.dto'
import { UuidParamDto } from '../dto/uuid-param.dto'
import { GalleryPhotoService } from './gallery-photo.service'

@Controller({ path: 'gallery/photos', version: '1' })
@ApiTags('GalleryPhotoV1')
export class GalleryPhotoV1Controller {
  constructor(private readonly galleryPhotoService: GalleryPhotoService) {}

  @Patch(':id/approve')
  @AuthGroups('pr', 'photo')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  async approveGalleryPhoto(@Param() { id }: UuidParamDto, @UserCtx() user: User) {
    await this.galleryPhotoService.approvePhoto(id, ProfileIdModel.fromObjectIdOrThrow(user.id))
  }

  @Patch(':id/reject')
  @AuthGroups('pr', 'photo')
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
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuditLog(GalleryPhotoV1Controller.prototype.resetGalleryPhotoApprovals.name)
  async resetGalleryPhotoApprovals(@Param() { id }: UuidParamDto) {
    await this.galleryPhotoService.resetApprovals(id)
  }
}
