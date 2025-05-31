import { ForbiddenException } from '@nestjs/common'

export class RecruitContext {
  constructor(
    public readonly currentSettingId: string,
    public readonly applicantId: string | null,
    public readonly manageableRecruitId: string[],
  ) {}

  hasPermissionOrThrow(settingId?: string) {
    if (!settingId || this.manageableRecruitId.includes(settingId)) return true
    else throw new ForbiddenException()
  }

  get applicantIdOrThrow(): string {
    if (this.applicantId) return this.applicantId
    else throw new ForbiddenException('The applicant has not been created')
  }

  get isModerator(): boolean {
    return !!this.manageableRecruitId
  }
}
