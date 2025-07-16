import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitOfferResponseEnum } from 'src/enums/recruit-offer-response.enum'

export class RecruitApplicantRoleModel {
  constructor(model?: Partial<RecruitApplicantRoleModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiPropertyOptional({ type: String })
  icon?: string | null

  @ApiPropertyOptional()
  selectedPriority?: number

  @ApiPropertyOptional()
  isCompleted?: boolean

  @ApiProperty({ enum: RecruitOfferResponseEnum })
  offerResponse: RecruitOfferResponseEnum

  @ApiPropertyOptional()
  offerExpireAt?: Date

  withSelectedPriority(selectedPriority?: number) {
    this.selectedPriority = selectedPriority
    return this
  }

  withIsCompleted(isCompleted?: boolean) {
    this.isCompleted = isCompleted
    return this
  }

  static fromEntity(entity: RecruitApplicantRoleEntity, isAnnounce = false, isModerator = false) {
    return new RecruitApplicantRoleModel({
      id: entity.role?.id,
      name: entity.role?.name,
      icon: entity.role?.icon,
      offerResponse: entity.determineOfferResponse(isAnnounce, isModerator),
      offerExpireAt: entity.offerExpireAt ?? undefined,
    })
  }
}
