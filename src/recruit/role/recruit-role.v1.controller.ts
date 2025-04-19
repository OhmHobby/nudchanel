import { Controller, Get, Query } from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { GetRecruitRoleDto } from '../dto/get-recruit-role.dto'
import { RecruitRoleModel } from '../models/recruit-role.model'
import { RecruitRolesModel } from '../models/recruit-roles.model'
import { RecruitRoleService } from './recruit-role.service'

@Controller({ path: 'recruit/roles', version: '1' })
@ApiTags('RecruitRoleV1')
export class RecruitRoleV1Controller {
  constructor(private readonly recruitRoleService: RecruitRoleService) {}

  @Get()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitRolesModel })
  async getRecruitRoles(
    @Query() { all }: GetRecruitRoleDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitRolesModel> {
    const roles = await this.recruitRoleService.getByRecruitId(ctx.currentSettingId, all)
    return new RecruitRolesModel({ roles: roles.map((role) => RecruitRoleModel.fromEntity(role)) })
  }
}
