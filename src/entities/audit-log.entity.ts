import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'

@Entity('audit_logs')
export class AuditLogEntity extends BaseEntity {
  constructor(entity?: DeepPartial<AuditLogEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId: string | null

  @Column({ type: 'uuid', nullable: true })
  actor: string | null

  @Column({ type: 'text' })
  action: string

  @Column({ type: 'text', nullable: true })
  path: string | null

  @Column({ type: 'jsonb', nullable: true })
  params: object | null

  @Column({ type: 'jsonb', nullable: true })
  queries: object | null

  @Column({ type: 'jsonb', nullable: true })
  body: object | null
}
