import { BaseEntity, Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { RecruitRoleEntity } from './recruit-role.entity'

@Entity('recruit_role_moderators')
@Unique('UNIQUE_RECRUIT_MODERATOR_PROFILE_ROLE', (entity: RecruitRoleModeratorEntity) => [
  entity.profileId,
  entity.roleId,
])
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
