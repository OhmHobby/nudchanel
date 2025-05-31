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
import { RecruitFormQuestionEntity } from './recruit-form-question.entity'

@Entity('recruit_form_answers')
@Unique('UNIQUE_RECRUIT_FORM_ANSWER_APPLICANT_QUESTION', (entity: RecruitFormAnswerEntity) => [
  entity.applicantId,
  entity.questionId,
])
export class RecruitFormAnswerEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitFormAnswerEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true })
  oid: string | null

  @Column({ type: 'text' })
  answer: string

  @ManyToOne(() => RecruitApplicantEntity)
  @JoinColumn({ name: 'applicant_id' })
  applicant?: RecruitApplicantEntity

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string

  @ManyToOne(() => RecruitFormQuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question?: RecruitFormQuestionEntity

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
