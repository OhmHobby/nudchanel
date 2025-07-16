import { RecruitOfferResponseEnum } from 'src/enums/recruit-offer-response.enum'
import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitApplicantEntity } from './recruit-applicant.entity'
import { RecruitRoleEntity } from './recruit-role.entity'

@Entity('recruit_applicant_roles')
@Unique('applicant_role_unique', ['applicantId', 'roleId'])
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

  @Column({ name: 'offer_accepted', type: 'boolean', default: false })
  offerAccepted: boolean

  @Column({ name: 'offer_expire_at', type: 'timestamptz', nullable: true })
  offerExpireAt: Date | null

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  determineOfferResponse(isAnnounce: boolean, isModerator: boolean, now = new Date()): RecruitOfferResponseEnum {
    if (!isAnnounce && !isModerator) return RecruitOfferResponseEnum.tba
    if (this.offerResponseAt || this.offerAccepted) {
      return this.offerAccepted ? RecruitOfferResponseEnum.accepted : RecruitOfferResponseEnum.declined
    }
    if (this.offerExpireAt) {
      return now.getTime() < this.offerExpireAt.getTime()
        ? RecruitOfferResponseEnum.pending
        : RecruitOfferResponseEnum.declined
    }
    return !isAnnounce && isModerator ? RecruitOfferResponseEnum.tba : RecruitOfferResponseEnum.rejected
  }
}
