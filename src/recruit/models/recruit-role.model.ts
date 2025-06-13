import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'

export class RecruitRoleModel {
  constructor(model?: Partial<RecruitRoleModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiPropertyOptional()
  description?: string

  @ApiPropertyOptional()
  icon?: string | null

  @ApiPropertyOptional()
  rank?: number

  @ApiPropertyOptional({ type: String })
  collectionId?: string | null

  @ApiPropertyOptional({ type: Boolean })
  isMandatory?: boolean | null

  static fromEntity(entity: RecruitRoleEntity) {
    return new RecruitRoleModel({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      rank: entity.rank,
      collectionId: entity.collectionId,
      isMandatory: entity.mandatory,
    })
  }
}
