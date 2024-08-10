import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { ImportProfilePhotoDto } from '../dto/import-profile-photo.dto'
import { ProfileIdDto } from '../dto/profile-id.dto'
import { ProfilePhotoService } from './profile-photo.service'

@Controller({ path: 'accounts/profiles', version: '1' })
@ApiTags('ProfileV1')
export class ProfileV1Controller {
  private readonly logger = new Logger(ProfileV1Controller.name)

  constructor(private readonly profilePhotoService: ProfilePhotoService) {}

  @Put(':profileId/photos')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @AuthGroups(['head'])
  @AuditLog(ProfileV1Controller.prototype.importProfilePhoto.name)
  async importProfilePhoto(
    @Param() { profileId }: ProfileIdDto,
    @Body() { directory, filename }: ImportProfilePhotoDto,
  ): Promise<void> {
    await this.profilePhotoService.importFromNas(directory, filename, profileId)
  }
}
