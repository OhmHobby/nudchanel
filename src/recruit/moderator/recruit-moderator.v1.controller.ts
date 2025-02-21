import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ProfileIdDto } from 'src/accounts/dto/profile-id.dto'
import { ProfileNameResponseModel } from 'src/accounts/models/profile-name.response.model'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { RecruitRoleModel } from '../models/recruit-role.model'
import { RecruitModeratorService } from './recruit-moderator.service'

@Controller({ path: 'recruit/moderator', version: '1' })
@ApiTags('RecruitModeratorV1')
export class RecruitModeratorV1Controller {
  constructor(private readonly recruitModeratorService: RecruitModeratorService) {}

  @Get('profiles/:profileId')
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: RecruitRoleModel, isArray: true })
  async getRecruitModeratorRoles(@Param() { profileId }: ProfileIdDto): Promise<RecruitRoleModel[]> {
    const roles = await this.recruitModeratorService.getModeratorRoles(profileId.uuid)
    return roles.map((role) => RecruitRoleModel.fromEntity(role))
  }

  @Get('roles/:id')
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: ProfileNameResponseModel, isArray: true })
  async getRecruitRoleModerator(@Param() { id }: UuidParamDto): Promise<ProfileNameResponseModel[]> {
    const profiles = await this.recruitModeratorService.getRoleModerators(id)
    return profiles.map((profile) => ProfileNameResponseModel.fromModel(profile))
  }

  @Post('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuditLog(RecruitModeratorV1Controller.prototype.addRecruitRoleModerator.name)
  async addRecruitRoleModerator(@Param() { id }: UuidParamDto, @Body() { profileId }: ProfileIdDto): Promise<void> {
    await this.recruitModeratorService.addRoleModerator(id, profileId.uuid)
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('it')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @AuditLog(RecruitModeratorV1Controller.prototype.addRecruitRoleModerator.name)
  async removeRecruitRoleModerator(@Param() { id }: UuidParamDto, @Body() { profileId }: ProfileIdDto): Promise<void> {
    await this.recruitModeratorService.removeRoleModerator(id, profileId.uuid)
  }
}
