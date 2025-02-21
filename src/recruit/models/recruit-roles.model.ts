import { ApiProperty } from '@nestjs/swagger'
import { RecruitRoleModel } from './recruit-role.model'

export class RecruitRolesModel {
  constructor(model?: Partial<RecruitRolesModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ type: RecruitRoleModel, isArray: true })
  roles: RecruitRoleModel[]
}
