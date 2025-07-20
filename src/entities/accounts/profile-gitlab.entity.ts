import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { BaseEntity, Column, CreateDateColumn, DeepPartial, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('profile_gitlab')
export class ProfileGitlabEntity extends BaseEntity {
  constructor(entity?: DeepPartial<ProfileGitlabEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ type: 'int', comment: 'GitLab user ID' })
  id: number

  @Column({ type: 'uuid' })
  profileId: string

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
