import { BaseEntity, Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { RecruitRoleEntity } from './recruit-role.entity'

@Entity('recruit_role_moderators')
export class RecruitRoleModeratorEntity extends BaseEntity {
  constructor(entity?: DeepPartial<RecruitRoleModeratorEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id = uuidv7()

  @Column({ type: 'uuid' })
  profileId: string

  @ManyToOne(() => RecruitRoleEntity)
  @JoinColumn({ name: 'role_id' })
  role?: RecruitRoleEntity

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string
}
