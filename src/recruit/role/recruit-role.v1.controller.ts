import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { CreateRecruitRoleDto } from '../dto/create-recruit-role.dto'
import { GetRecruitRoleDto } from '../dto/get-recruit-role.dto'
import { SelectRecruitRolesDto } from '../dto/select-recruit-roles.dto'
import { UpdateRecruitRoleDto } from '../dto/update-recruit-role.dto'
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

  @Get(':id')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: `Get a specific role by ID`,
    description: 'Get detailed information about a specific recruit role',
  })
  @ApiOkResponse({ type: RecruitRoleModel })
  async getRecruitRole(@Param() { id }: UuidParamDto): Promise<RecruitRoleModel> {
    const role = await this.recruitRoleService.getRoleById(id)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    return RecruitRoleModel.fromEntity(role)
  }

  @Post()
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: `Create a new recruit role`,
    description: 'Create a new role for recruitment',
  })
  @ApiCreatedResponse({ type: RecruitRoleModel })
  async createRecruitRole(@Body() createRoleDto: CreateRecruitRoleDto): Promise<RecruitRoleModel> {
    const role = await this.recruitRoleService.createRole(createRoleDto)
    return RecruitRoleModel.fromEntity(role)
  }

  @Put(':id')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: `Update a recruit role`,
    description: 'Update an existing recruit role',
  })
  @ApiOkResponse({ type: RecruitRoleModel })
  async updateRecruitRole(
    @Param() { id }: UuidParamDto,
    @Body() updateRoleDto: UpdateRecruitRoleDto,
  ): Promise<RecruitRoleModel> {
    const role = await this.recruitRoleService.updateRole(id, updateRoleDto)
    return RecruitRoleModel.fromEntity(role)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: `Delete a recruit role`,
    description: 'Delete an existing recruit role',
  })
  @ApiNoContentResponse()
  async deleteRecruitRole(@Param() { id }: UuidParamDto): Promise<void> {
    await this.recruitRoleService.deleteRole(id)
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
