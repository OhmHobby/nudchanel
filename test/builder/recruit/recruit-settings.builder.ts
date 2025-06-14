import dayjs from 'dayjs'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'

const INFINITE_DATE = new Date('2100-01-01T00:00:00.000Z')

export class RecruitSettingBuilder {
  private readonly entity: RecruitSettingEntity

  constructor() {
    this.entity = new RecruitSettingEntity()
    this.entity.id = '01976d72-ccc5-7aac-aca6-6c6d5cb606ad'
    this.entity.name = 'Mock Recruit Settings'
    this.entity.openWhen = dayjs().subtract(1, 'day').toDate()
  }

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withAnnounce(isAnnounced: boolean) {
    this.entity.announceWhen = isAnnounced ? dayjs().subtract(1, 'day').toDate() : INFINITE_DATE
    return this
  }

  withOpen(isOpen: boolean) {
    this.entity.openWhen = isOpen ? dayjs().subtract(1, 'day').toDate() : INFINITE_DATE
    return this
  }

  withClose(isClosed: boolean) {
    this.entity.closeWhen = isClosed ? dayjs().add(1, 'day').toDate() : INFINITE_DATE
    return this
  }

  build() {
    return this.entity
  }
}
