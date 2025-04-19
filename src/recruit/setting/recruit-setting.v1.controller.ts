import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { GetRecruitSettingsDto } from '../dto/get-recruit-settings.dto'
import { RecruitSettingModel } from '../models/recruit-setting.model'
import { RecruitSettingService } from './recruit-setting.service'

@Controller({ path: 'recruit/settings', version: '1' })
@ApiTags('RecruitSettingV1')
export class RecruitSettingV1Controller {
  constructor(private readonly recruitSettingService: RecruitSettingService) {}

  @Get()
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [RecruitSettingModel] })
  async getRecruitSettings(
    @Query() { all }: GetRecruitSettingsDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitSettingModel[]> {
    const ids = all ? undefined : ctx.manageableRecruitId
    const settings = await this.recruitSettingService.list(ids)
    return settings.map((setting) => RecruitSettingModel.fromEntity(setting))
  }

  @Get(':id')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: RecruitSettingModel })
  async getRecruitSetting(@Param() { id }: UuidParamDto): Promise<RecruitSettingModel> {
    const setting = await this.recruitSettingService.getById(id)
    if (!setting) throw new NotFoundException()
    return RecruitSettingModel.fromEntity(setting)
  }
}
