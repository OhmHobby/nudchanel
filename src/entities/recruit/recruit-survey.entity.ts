import { BaseEntity, Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { RecruitFormCollectionEntity } from './recruit-form-collection.entity'
import { RecruitSettingEntity } from './recruit-setting.entity'

@Entity('recruit_surveys')
@Unique('UNIQUE_RECRUIT_SURVEY', (entity: RecruitSurveyEntity) => [entity.recruitId, entity.collectionId])
export class RecruitSurveyEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitSurveyEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => RecruitSettingEntity)
  @JoinColumn({ name: 'recruit_id' })
  recruit?: RecruitSettingEntity

  @Column({ name: 'recruit_id', type: 'uuid' })
  recruitId: string

  @ManyToOne(() => RecruitFormCollectionEntity)
  @JoinColumn({ name: 'collection_id' })
  collection?: RecruitFormCollectionEntity

  @Column({ name: 'collection_id', type: 'uuid', nullable: true })
  collectionId: string | null
}
