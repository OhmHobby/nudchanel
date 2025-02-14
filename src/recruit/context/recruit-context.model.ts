import { ForbiddenException } from '@nestjs/common'

export class RecruitContext {
  constructor(
    public readonly currentSettingId: string,
    public readonly manageableRecruitId: string[],
  ) {}

  hasPermissionOrThrow(settingId: string) {
    if (this.manageableRecruitId.includes(settingId)) return true
    else throw new ForbiddenException()
  }
}
