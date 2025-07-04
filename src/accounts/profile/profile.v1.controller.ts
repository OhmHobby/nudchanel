import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { Types } from 'mongoose'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ImportProfilePhotoDto } from '../dto/import-profile-photo.dto'
import { ProfileIdDto } from '../dto/profile-id.dto'
import { UpdateProfileContactDto } from '../dto/update-profile-contact.dto'
import { UpdateProfileNameDto } from '../dto/update-profile-name.dto'
import { ProfileContactResponseModel } from '../models/profile-contact.response.model'
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
  @AuthGroups()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  async getMyProfile(@UserCtx() user: User): Promise<ProfileResponseModel> {
    const doc = await this.profileService.findByIdPopulated(new Types.ObjectId(user.id!))
    if (!doc) throw new NotFoundException('Profile not found')
    return ProfileResponseModel.fromModel(doc)
  }

  @Get('me/contacts')
  @AuthGroups()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileContactResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  async getMyContacts(@UserCtx() user: User): Promise<ProfileContactResponseModel> {
    const doc = await this.profileService.findById(new Types.ObjectId(user.id!), true)
    if (!doc) throw new NotFoundException('Profile not found')
    return ProfileContactResponseModel.fromModel(doc)
  }

  @Put('me/contacts')
  @AuthGroups()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  async updateMyContacts(@Body() dto: UpdateProfileContactDto, @UserCtx() user: User): Promise<void> {
    const profileId = new Types.ObjectId(user.id!)
    const updatedProfile = await this.profileService.updateContactInfo(profileId, dto)
    if (!updatedProfile) throw new NotFoundException('Profile not found')
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

  @Get(':profileId/contacts')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileContactResponseModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('nudch')
  async getProfileContacts(@Param() { profileId }: ProfileIdDto): Promise<ProfileContactResponseModel> {
    const doc = await this.profileService.findById(profileId.objectId)
    if (!doc) throw new NotFoundException('Profile not found')
    return ProfileContactResponseModel.fromModel(doc)
  }

  @Put(':profileId/contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('head')
  async updateProfileContacts(
    @Param() { profileId }: ProfileIdDto,
    @Body() dto: UpdateProfileContactDto,
  ): Promise<void> {
    const updatedProfile = await this.profileService.updateContactInfo(profileId.objectId, dto)
    if (!updatedProfile) throw new NotFoundException('Profile not found')
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
