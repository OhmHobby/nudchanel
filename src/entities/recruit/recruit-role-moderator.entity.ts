import { BaseEntity, Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { RecruitRoleEntity } from './recruit-role.entity'

@Entity('recruit_role_moderators')
export class RecruitRoleModeratorEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitRoleModeratorEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string

  @ManyToOne(() => RecruitRoleEntity)
  @JoinColumn({ name: 'role_id' })
  role?: RecruitRoleEntity

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string
}
