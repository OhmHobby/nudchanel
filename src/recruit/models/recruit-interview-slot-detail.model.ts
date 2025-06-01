import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitApplicantModel } from './recruit-applicant.model'
import { RecruitInterviewSlotModel } from './recruit-interview-slot.model'
import { RecruitRoleModel } from './recruit-role.model'

export class RecruitInterviewSlotDetailModel extends RecruitInterviewSlotModel {
  constructor(model?: Partial<RecruitInterviewSlotDetailModel>) {
    super(model)
    Object.assign(this, model)
  }

  @ApiProperty({ type: RecruitRoleModel, isArray: true })
  roles?: RecruitRoleModel[]

  @ApiPropertyOptional()
  isAvailable?: Boolean

  @ApiPropertyOptional()
  isSelected?: Boolean

  @ApiPropertyOptional({ type: RecruitApplicantModel, isArray: true })
  applicants?: RecruitApplicantModel[]
}
