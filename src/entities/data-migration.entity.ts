import { BaseEntity, DeepPartial, Entity, PrimaryColumn } from 'typeorm'

@Entity('data_migrations')
export class DataMigrationEntity extends BaseEntity {
  constructor(entity?: DeepPartial<DataMigrationEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ length: 31 })
  id: string
}
