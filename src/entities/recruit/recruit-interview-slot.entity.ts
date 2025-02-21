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

@Entity('recruit_interview_slots')
export class RecruitInterviewSlotEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitInterviewSlotEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true, select: false })
  oid: string | null

  @Column({ name: 'start_when', type: 'timestamptz' })
  startWhen: Date

  @Column({ name: 'end_when', type: 'timestamptz' })
  endWhen: Date

  @Column({ name: 'interview_at', type: 'timestamptz', nullable: true })
  interviewAt: Date | null

  @ManyToOne(() => RecruitRoleEntity)
  @JoinColumn({ name: 'role_id' })
  role?: RecruitRoleEntity

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string | null

  @ManyToOne(() => RecruitApplicantEntity)
  @JoinColumn({ name: 'applicant_id' })
  applicant?: RecruitApplicantEntity

  @Column({ name: 'applicant_id', type: 'uuid', nullable: true })
  applicantId: string | null

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
