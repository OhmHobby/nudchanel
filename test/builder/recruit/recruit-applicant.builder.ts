import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'

export class RecruitApplicantBuilder {
  private readonly entity: RecruitApplicantEntity

  constructor() {
    this.entity = new RecruitApplicantEntity()
    this.entity.id = '01976d89-0982-7aac-aca6-77ee02d11382'
    this.entity.profileId = '2e008ed0-0f1e-4297-90c1-715c360c958b'
  }

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withProfileId(profileId: string) {
    this.entity.profileId = profileId
    return this
  }

  withRecruitId(recruitId: string) {
    this.entity.recruitId = recruitId
    return this
  }

  build() {
    return this.entity
  }
}
