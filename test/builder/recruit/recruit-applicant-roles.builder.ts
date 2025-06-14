import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'

export class RecruitApplicantRoleBuilder {
  private readonly entity: RecruitApplicantRoleEntity

  constructor() {
    this.entity = new RecruitApplicantRoleEntity()
    this.entity.id = '01976d8d-4295-7aac-aca6-7a61ffdf65e8'
  }

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withApplicantId(applicantId: string) {
    this.entity.applicantId = applicantId
    return this
  }

  withRoleId(roleId: string) {
    this.entity.roleId = roleId
    return this
  }

  withAccepted(isAccepted: boolean) {
    this.entity.offerAccepted = isAccepted
    return this
  }

  withOffer(expireAt: Date | null) {
    this.entity.offerExpireAt = expireAt
    return this
  }

  withResponseAt(responseAt: Date | null) {
    this.entity.offerResponseAt = responseAt
    return this
  }

  build() {
    return this.entity
  }
}
