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
import { RecruitFormCollectionEntity } from './recruit-form-collection.entity'

@Entity('recruit_settings')
export class RecruitSettingEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitSettingEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true })
  oid: string | null

  @Column({ type: 'smallint' })
  year: number

  @Column({ type: 'text' })
  name: string

  @Column({ name: 'open_when', type: 'timestamptz' })
  openWhen: Date

  @Column({ name: 'close_when', type: 'timestamptz' })
  closeWhen: Date

  @Column({ name: 'announce_when', type: 'timestamptz' })
  announceWhen: Date

  @Column({ name: 'maximum_role', type: 'smallint', default: 1 })
  maximumRole: number

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean

  @ManyToOne(() => RecruitFormCollectionEntity)
  @JoinColumn({ name: 'survey_collection_id' })
  surveyCollection?: RecruitFormCollectionEntity

  @Column({ name: 'survey_collection_id', type: 'uuid', nullable: true })
  surveyCollectionId: string | null

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
