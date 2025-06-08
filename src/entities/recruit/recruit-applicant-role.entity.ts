import { RecruitOfferResponseEnum } from 'src/enums/recruit-offer-response.enum'
import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitApplicantEntity } from './recruit-applicant.entity'
import { RecruitRoleEntity } from './recruit-role.entity'

@Entity('recruit_applicant_roles')
export class RecruitApplicantRoleEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitApplicantRoleEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'smallint', default: 0 })
  rank: number

  @ManyToOne(() => RecruitApplicantEntity)
  @JoinColumn({ name: 'applicant_id' })
  applicant?: RecruitApplicantEntity

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string

  @ManyToOne(() => RecruitRoleEntity)
  @JoinColumn({ name: 'role_id' })
  role?: RecruitRoleEntity

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string

  @Column({ name: 'offer_response_at', type: 'timestamptz', nullable: true })
  offerResponseAt: Date | null

  @Column({ type: 'boolean', default: false })
  offerAccepted: boolean

  @Column({ name: 'offer_expire_at', type: 'timestamptz', nullable: true })
  offerExpireAt: Date | null

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  determineOfferResponse(now = new Date()): RecruitOfferResponseEnum {
    if (
      this.offerResponseAt ||
      this.offerAccepted ||
      (this.offerExpireAt && now.getTime() >= this.offerExpireAt.getTime())
    ) {
      return this.offerAccepted ? RecruitOfferResponseEnum.accepted : RecruitOfferResponseEnum.declined
    } else if (this.offerAccepted === false) {
      return this.offerExpireAt ? RecruitOfferResponseEnum.pending : RecruitOfferResponseEnum.rejected
    } else return RecruitOfferResponseEnum.tba
  }
}
