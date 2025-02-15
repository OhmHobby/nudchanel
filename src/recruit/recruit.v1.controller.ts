import { Controller, Get, NotFoundException } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RecruitCtx } from './context/recruit-context.decorator'
import { RecruitContext } from './context/recruit-context.model'
import { RecruitSettingModel } from './models/recruit-setting.models'
import { RecruitSettingService } from './setting/recruit-setting.service'

@Controller({ path: 'recruit', version: '1' })
@ApiTags('RecruitV1')
export class RecruitV1Controller {
  constructor(private readonly recruitSettingService: RecruitSettingService) {}

  @Get()
  @ApiOkResponse({ type: RecruitSettingModel })
  async getCurrentRecruitSetting(@RecruitCtx() ctx: RecruitContext): Promise<RecruitSettingModel> {
    const entity = await this.recruitSettingService.getById(ctx.currentSettingId)
    if (!entity) throw new NotFoundException()
    return RecruitSettingModel.fromEntity(entity)
  }
}
