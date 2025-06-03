import { ForbiddenException } from '@nestjs/common'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'

export class RecruitContext {
  constructor(
    public readonly currentSettingId: string,
    public readonly applicant: RecruitApplicantEntity | null,
    public readonly manageableRecruitId: string[],
  ) {}

  get applicantId(): string | null {
    return this.applicant?.id ?? null
  }

  hasPermissionOrThrow(settingId?: string) {
    if (!settingId || this.manageableRecruitId.includes(settingId)) return true
    else throw new ForbiddenException()
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
