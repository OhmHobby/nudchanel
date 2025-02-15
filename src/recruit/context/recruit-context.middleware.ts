import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitSettingService } from '../setting/recruit-setting.service'
import { RecruitContext } from './recruit-context.model'

@Injectable()
export class RecruitContextMiddleware implements NestMiddleware {
  constructor(
    private readonly settingService: RecruitSettingService,
    private readonly moderatorService: RecruitModeratorService,
  ) {}

  async use(req: RequestWithCtx, res: Response, nextFunction: NextFunction) {
    const [settingId, manageableRecruitId] = await Promise.all([
      this.settingService.getCurrentId(),
      this.moderatorService.getManageableRecruitId(ProfileIdModel.fromObjectId(req.user.id)),
    ])
    req.recruit = new RecruitContext(settingId!, manageableRecruitId)
    nextFunction()
  }
}
