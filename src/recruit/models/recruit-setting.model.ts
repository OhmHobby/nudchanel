import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { RecruitFormCollectionModel } from './recruit-form-collection.model'

export class RecruitSettingModel {
  constructor(model?: Partial<RecruitSettingModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  year: number

  @ApiProperty()
  name: string

  @ApiProperty()
  openWhen: Date

  @ApiProperty()
  closeWhen: Date

  @ApiProperty()
  announceWhen: Date

  @ApiProperty()
  maximumRole: number

  @ApiProperty()
  isActive: boolean

  @ApiPropertyOptional({ type: RecruitFormCollectionModel, isArray: true })
  collections?: RecruitFormCollectionModel[]

  withCollectionEntities(entities?: RecruitFormCollectionEntity[], completionMap?: Map<string, boolean>) {
    this.collections = entities?.map((entity) =>
      RecruitFormCollectionModel.fromEntity(entity).withIsCompleted(completionMap?.get(entity.id)),
    )
    return this
  }

  static fromEntity(entity: RecruitSettingEntity) {
    return new RecruitSettingModel({
      id: entity.id,
      year: entity.year,
      name: entity.name,
      openWhen: entity.openWhen,
      closeWhen: entity.closeWhen,
      announceWhen: entity.announceWhen,
      maximumRole: entity.maximumRole,
      isActive: entity.isActive,
    })
  }
}
