import {
  BaseEntity,
  Column,
  DeepPartial,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitApplicantEntity } from './recruit-applicant.entity'

@Entity('recruit_notes')
export class RecruitNoteEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitNoteEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true })
  oid: string | null

  @Column({ type: 'text' })
  note: string

  @Column({ name: 'only_me', type: 'boolean', default: false })
  onlyMe: boolean

  @ManyToOne(() => RecruitApplicantEntity)
  @JoinColumn({ name: 'applicant_id' })
  applicant?: RecruitApplicantEntity

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', select: false })
  deletedAt?: Date
}
