import { Controller, Get, NotFoundException } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { UserCtx } from 'src/auth/user.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RecruitCtx } from './context/recruit-context.decorator'
import { RecruitContext } from './context/recruit-context.model'
import { RecruitFormService } from './form/recruit-form.service'
import { RecruitSettingModel } from './models/recruit-setting.model'
import { RecruitSettingService } from './setting/recruit-setting.service'

@Controller({ path: 'recruit', version: '1' })
@ApiTags('RecruitV1')
export class RecruitV1Controller {
  constructor(
    private readonly recruitSettingService: RecruitSettingService,
    private readonly recruitFormService: RecruitFormService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitSettingModel })
  async getCurrentRecruitSetting(
    @UserCtx() user: User,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitSettingModel> {
    const [entity, collections] = await Promise.all([
      this.recruitSettingService.getById(ctx.currentSettingId),
      user.isSignedIn()
        ? this.recruitFormService.getMandatoryCollections(ctx.currentSettingId)
        : Promise.resolve(undefined),
    ])
    if (!entity) throw new NotFoundException()
    const completionMap = await this.recruitFormService.getCompletionMap(
      ctx.applicantId ?? undefined,
      collections?.map((el) => el.id),
    )
    return RecruitSettingModel.fromEntity(entity).withCollectionEntities(collections, completionMap)
  }
}
