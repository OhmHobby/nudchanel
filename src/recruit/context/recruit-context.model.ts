import { ForbiddenException, NotAcceptableException } from '@nestjs/common'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'

export class RecruitContext {
  constructor(
    public readonly currentSetting: RecruitSettingEntity,
    public readonly applicant: RecruitApplicantEntity | null,
    public readonly manageableRecruitId: string[],
  ) {}

  get applicantId(): string | null {
    return this.applicant?.id ?? null
  }

  get currentSettingId(): string {
    return this.currentSetting.id
  }

  hasPermissionOrThrow(settingId?: string) {
    if (!settingId || this.manageableRecruitId.includes(settingId)) return true
    else throw new ForbiddenException()
  }

  isRegistrationOpenOrThrow(currentDate = new Date()) {
    if (
      currentDate.getTime() >= this.currentSetting.openWhen.getTime() &&
      currentDate.getTime() <= this.currentSetting.closeWhen.getTime()
    )
      return true
    else throw new NotAcceptableException('Registration closed')
  }

  get applicantOrThrow(): RecruitApplicantEntity {
    if (this.applicant) return this.applicant
    else throw new ForbiddenException('The applicant has not been created')
  }

  get applicantIdOrThrow(): string {
    if (this.applicantId) return this.applicantId
    else throw new ForbiddenException('The applicant has not been created')
  }

  get isModerator(): boolean {
    return !!this.manageableRecruitId
  }
}
