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
  rank?: number

  @ApiPropertyOptional()
  selectedPriority?: number

  @ApiPropertyOptional()
  collectionId?: string | null

  @ApiPropertyOptional()
  isCompleted?: boolean

  @ApiPropertyOptional()
  isMandatory?: boolean | null

  withSelectedPriority(selectedPriority?: number) {
    this.selectedPriority = selectedPriority
    return this
  }

  withIsCompleted(isCompleted?: boolean) {
    this.isCompleted = isCompleted
    return this
  }

  static fromEntity(entity: RecruitRoleEntity) {
    return new RecruitRoleModel({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      rank: entity.rank,
      collectionId: entity.collectionId,
      isMandatory: entity.mandatory,
    })
  }
}
