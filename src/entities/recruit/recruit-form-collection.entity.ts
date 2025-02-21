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
import { RecruitSettingEntity } from './recruit-setting.entity'

@Entity('recruit_form_collections')
export class RecruitFormCollectionEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitFormCollectionEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true, select: false })
  oid: string | null

  @Column({ type: 'text' })
  title: string

  @ManyToOne(() => RecruitSettingEntity)
  @JoinColumn({ name: 'recruit_id' })
  recruit?: RecruitSettingEntity

  @Column({ name: 'recruit_id', type: 'uuid' })
  recruitId: string

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
