import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('user_local_users')
@Unique(['username'])
export class UserLocalUserEntity extends BaseEntity {
  constructor(entity?: DeepPartial<UserLocalUserEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'password', type: 'text', select: false })
  password: string

  @Column({ name: 'password_last_set', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  passwordLastSet: Date

  @Column({ name: 'disabled', type: 'boolean', default: false })
  disabled: boolean
}
