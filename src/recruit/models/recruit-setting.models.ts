import { ApiProperty } from '@nestjs/swagger'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'

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
