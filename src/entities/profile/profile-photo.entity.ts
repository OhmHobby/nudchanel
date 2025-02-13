import { join } from 'path'
import { BaseEntity, Column, CreateDateColumn, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('profile_photos')
export class ProfilePhotoEntity extends BaseEntity {
  constructor(entity?: DeepPartial<ProfilePhotoEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @Column({ type: 'text' })
  directory: string

  @Column({ type: 'text' })
  filename: string

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
  createdAt: Date

  get fullpath(): string {
    return join(this.directory, this.filename)
  }
}
