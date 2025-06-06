import { Body, Controller, Get, HttpCode, HttpStatus, Put, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { GetRecruitRoleDto } from '../dto/get-recruit-role.dto'
import { SelectRecruitRolesDto } from '../dto/select-recruit-roles.dto'
import { RecruitRoleModel } from '../models/recruit-role.model'
import { RecruitRolesModel } from '../models/recruit-roles.model'
import { RecruitRoleService } from './recruit-role.service'

@Controller({ path: 'recruit/roles', version: '1' })
@ApiTags('RecruitRoleV1')
export class RecruitRoleV1Controller {
  constructor(private readonly recruitRoleService: RecruitRoleService) {}

  @Get()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({
    summary: `Get all open roles`,
    description: `Applicant shouldn't see the mandatory (hidden) roles. Moderator requests with 'all' to see mandatory roles`,
  })
  @ApiOkResponse({ type: RecruitRolesModel })
  async getRecruitRoles(
    @Query() { all }: GetRecruitRoleDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitRolesModel> {
    const roles = await this.recruitRoleService.getByRecruitId(ctx.currentSettingId, all)
    return new RecruitRolesModel({ roles: roles.map((role) => RecruitRoleModel.fromEntity(role)) })
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: `Update the selected roles`,
    description: 'Only selectable roles. Do not send mandatory roles',
  })
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiNoContentResponse()
  async selectRecruitRoles(
    @Body() { roleIds }: SelectRecruitRolesDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<void> {
    ctx.isRegistrationOpenOrThrow()
    await this.recruitRoleService.selectRoles(ctx.applicantOrThrow, roleIds)
  }
}
