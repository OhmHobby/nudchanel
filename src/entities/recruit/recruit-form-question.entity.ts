import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitFormAnswerEntity } from './recruit-form-answer.entity'
import { RecruitFormCollectionEntity } from './recruit-form-collection.entity'

@Entity('recruit_form_questions')
export class RecruitFormQuestionEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitFormQuestionEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true })
  oid: string | null

  @ManyToOne(() => RecruitFormCollectionEntity)
  @JoinColumn({ name: 'collection_id' })
  collection?: RecruitFormCollectionEntity

  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string | null

  @Column({ type: 'text' })
  question: string

  @Column({ type: 'text' })
  input: string

  @Column({ type: 'jsonb', nullable: true })
  options: string[] | null

  @Column({ type: 'smallint', default: 0 })
  rank: number

  @OneToMany(() => RecruitFormAnswerEntity, (answer: RecruitFormAnswerEntity) => answer.question)
  answers?: RecruitFormAnswerEntity[]

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
