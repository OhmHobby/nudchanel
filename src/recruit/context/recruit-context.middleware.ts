import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { Span } from 'nestjs-otel'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitSettingService } from '../setting/recruit-setting.service'
import { RecruitContext } from './recruit-context.model'

@Injectable()
export class RecruitContextMiddleware implements NestMiddleware {
  constructor(
    private readonly applicantService: RecruitApplicantService,
    private readonly moderatorService: RecruitModeratorService,
    private readonly settingService: RecruitSettingService,
  ) {}

  @Span()
  async use(req: RequestWithCtx, res: Response, nextFunction: NextFunction) {
    const settingIdFromHeader = req.headers[RECRUIT_SETTING_ID]?.toString()
    const profileId = ProfileIdModel.fromObjectId(req.user.id)?.uuid
    const [setting, manageableRecruitId] = await Promise.all([
      settingIdFromHeader ? this.settingService.getById(settingIdFromHeader) : this.settingService.getCurrentSetting(),
      this.moderatorService.getManageableRecruitId(profileId),
    ])
    if (!setting) throw new InternalServerErrorException('No active recruitment')
    const applicant = await this.applicantService.findOne(undefined, setting.id, profileId)
    req.recruit = new RecruitContext(setting, applicant, manageableRecruitId)
    nextFunction()
  }
}
