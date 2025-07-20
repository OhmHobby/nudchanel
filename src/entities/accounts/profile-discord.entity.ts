import { Snowflake } from 'discord.js'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { BaseEntity, Column, CreateDateColumn, DeepPartial, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('profile_discords')
export class ProfileDiscordEntity extends BaseEntity {
  constructor(entity?: DeepPartial<ProfileDiscordEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ type: 'bigint', comment: 'Discord user ID (Snowflake uint64)' })
  id: Snowflake

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @Column({ name: 'rank', type: 'integer', default: 0 })
  rank: number

  @Column({ type: 'text', nullable: true })
  avatar: string | null

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: true })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: true })
  updatedAt: Date

  get profileOid() {
    return ObjectIdUuidConverter.toObjectId(this.profileId)
  }
}
