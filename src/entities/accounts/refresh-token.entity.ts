import { BaseEntity, Column, CreateDateColumn, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { uuidv4 } from 'uuidv7'

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RefreshTokenEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4()

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date

  @Column({ name: 'next_token', type: 'uuid', nullable: true })
  nextToken: string | null

  @Column({ name: 'is_mfa_enabled', type: 'boolean', default: false })
  isMfaEnabled: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: true })
  createdAt: Date
}
