import { ApiProperty } from '@nestjs/swagger'
import { RecruitApplicantModel } from './recruit-applicant.model'

export class RecruitApplicantsModel {
  constructor(model?: Partial<RecruitApplicantsModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ type: RecruitApplicantsModel, isArray: true })
  applicants: RecruitApplicantModel[]
}
