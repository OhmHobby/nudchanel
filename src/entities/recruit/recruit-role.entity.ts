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
import { RecruitSettingEntity } from './recruit-setting.entity'

@Entity('recruit_roles')
export class RecruitRoleEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitRoleEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid', nullable: true, select: false })
  oid: string | null

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'text', nullable: true })
  icon: string | null

  @Column({ type: 'smallint', default: 0 })
  rank: number

  @Column({ type: 'boolean' })
  mandatory: boolean

  @ManyToOne(() => RecruitSettingEntity)
  @JoinColumn({ name: 'recruit_id' })
  recruit?: RecruitSettingEntity

  @Column({ name: 'recruit_id', type: 'uuid', select: false })
  recruitId: string

  @ManyToOne(() => RecruitFormCollectionEntity)
  @JoinColumn({ name: 'collection_id' })
  collection?: RecruitFormCollectionEntity

  @Column({ name: 'collection_id', type: 'uuid', nullable: true })
  collectionId: string | null

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
