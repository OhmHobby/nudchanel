import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { Types } from 'mongoose'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ImportProfilePhotoDto } from '../dto/import-profile-photo.dto'
import { ProfileIdDto } from '../dto/profile-id.dto'
import { UpdateProfileNameDto } from '../dto/update-profile-name.dto'
import { ProfilePhotoResponseModel } from '../models/profile-photo.response-model'
import { ProfileResponseModel } from '../models/profile.response.model'
import { ProfileNameService } from './profile-name.service'
import { ProfilePhotoService } from './profile-photo.service'
import { ProfileService } from './profile.service'

@Controller({ path: 'accounts/profiles', version: '1' })
@ApiTags('ProfileV1')
export class ProfileV1Controller {
  private readonly logger = new Logger(ProfileV1Controller.name)

  constructor(
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
    private readonly profilePhotoService: ProfilePhotoService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups()
  async getMyProfile(@UserCtx() user: User): Promise<ProfileResponseModel> {
    const doc = await this.profileService.findByIdPopulated(new Types.ObjectId(user.id!))
    return ProfileResponseModel.fromModel(doc!)
  }

  @Put('me/name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  async updateMyProfileName(@Body() dto: UpdateProfileNameDto, @UserCtx() user: User): Promise<void> {
    const profileId = new Types.ObjectId(user.id!)
    await Promise.all([
      this.profileNameService.upsert('en', profileId, dto.name.toModel()),
      this.profileNameService.upsert('th', profileId, dto.localName.toModel()),
    ])
  }

  @Put(':profileId/name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('head')
  async updateProfileName(@Param() { profileId }: ProfileIdDto, @Body() dto: UpdateProfileNameDto): Promise<void> {
    await Promise.all([
      this.profileNameService.upsert('en', profileId.objectId, dto.name.toModel()),
      this.profileNameService.upsert('th', profileId.objectId, dto.localName.toModel()),
    ])
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
    const entity = await this.profilePhotoService.importFromNas(directory, filename, profileId.objectId)
    return ProfilePhotoResponseModel.fromEntity(entity)
  }
}
