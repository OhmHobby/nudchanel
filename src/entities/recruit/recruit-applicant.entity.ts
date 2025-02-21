import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitApplicantRoleEntity } from './recruit-applicant-role.entity'
import { RecruitInterviewSlotEntity } from './recruit-interview-slot.entity'
import { RecruitSettingEntity } from './recruit-setting.entity'

@Entity('recruit_applicants')
@Unique('UNIQUE_RECRUIT_APPLICANT_PROFILE', (entity: RecruitApplicantEntity) => [entity.profileId, entity.recruitId])
export class RecruitApplicantEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitApplicantEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true })
  oid: string | null

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @ManyToOne(() => RecruitSettingEntity)
  @JoinColumn({ name: 'recruit_id' })
  recruit?: RecruitSettingEntity

  @Column({ name: 'recruit_id', type: 'uuid', select: false })
  recruitId: string

  @OneToMany(() => RecruitApplicantRoleEntity, (role: RecruitApplicantRoleEntity) => role.applicant)
  roles?: RecruitApplicantRoleEntity[]

  @OneToMany(() => RecruitInterviewSlotEntity, (slot: RecruitInterviewSlotEntity) => slot.applicant)
  interviewSlots?: RecruitInterviewSlotEntity[]

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
