import { BaseEntity, Column, DeepPartial, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('application_settings')
export class ApplicationSettingEntity extends BaseEntity {
  constructor(entity?: DeepPartial<ApplicationSettingEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ type: 'text' })
  value: string

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date
}
