import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'

export class RecruitRoleBuilder {
  private readonly entity: RecruitRoleEntity

  constructor() {
    this.entity = new RecruitRoleEntity()
    this.entity.id = '01976d72-ccc5-7aac-aca6-6c6d5cb606ad'
    this.entity.name = 'Mock Recruit Role'
    this.entity.description = 'This is a mock recruit role for testing purposes.'
  }

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withName(name: string) {
    this.entity.name = name
    return this
  }

  withDescription(description: string) {
    this.entity.description = description
    return this
  }

  build() {
    return this.entity
  }
}
