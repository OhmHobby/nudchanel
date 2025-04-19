import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitSettingService } from '../setting/recruit-setting.service'
import { RecruitContext } from './recruit-context.model'
import { Span } from 'nestjs-otel'

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
    const [settingId, manageableRecruitId] = await Promise.all([
      settingIdFromHeader ? Promise.resolve(settingIdFromHeader) : this.settingService.getCurrentId(),
      this.moderatorService.getManageableRecruitId(profileId),
    ])
    if (!settingId) throw new InternalServerErrorException('No active recruitment')
    const applicantId = await this.applicantService.getIdBySettingProfileId(settingId, profileId)
    req.recruit = new RecruitContext(settingId, applicantId, manageableRecruitId)
    req.recruit.hasPermissionOrThrow(settingIdFromHeader)
    nextFunction()
  }
}
