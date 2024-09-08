import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ImportProfilePhotoDto } from '../dto/import-profile-photo.dto'
import { ProfileIdDto } from '../dto/profile-id.dto'
import { ProfilePhotoResponseModel } from '../models/profile-photo.response-model'
import { ProfileResponseModel } from '../models/profile.response.model'
import { ProfilePhotoService } from './profile-photo.service'
import { ProfileService } from './profile.service'

@Controller({ path: 'accounts/profiles', version: '1' })
@ApiTags('ProfileV1')
export class ProfileV1Controller {
  private readonly logger = new Logger(ProfileV1Controller.name)

  constructor(
    private readonly profileService: ProfileService,
    private readonly profilePhotoService: ProfilePhotoService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups()
  @AuditLog(ProfileV1Controller.prototype.importProfilePhoto.name)
  async getMyProfile(@UserCtx() user: User): Promise<ProfileResponseModel> {
    const doc = await this.profileService.findByIdPopulated(user.id!)
    return ProfileResponseModel.fromModel(doc!)
  }

  @Put(':profileId/photos')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfilePhotoResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('head')
  @AuditLog(ProfileV1Controller.prototype.importProfilePhoto.name)
  async importProfilePhoto(
    @Param() { profileId }: ProfileIdDto,
    @Body() { directory, filename }: ImportProfilePhotoDto,
  ): Promise<ProfilePhotoResponseModel> {
    const doc = await this.profilePhotoService.importFromNas(directory, filename, profileId)
    return ProfilePhotoResponseModel.fromModel(doc)
  }
}
