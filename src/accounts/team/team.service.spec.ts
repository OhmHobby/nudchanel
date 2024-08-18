import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass, Ref } from '@typegoose/typegoose'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { TeamService } from './team.service'

describe(TeamService.name, () => {
  let service: TeamService
  const teamMemberModel = getModelForClass(TeamMemberModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamService, { provide: getModelToken(TeamMemberModel.name), useValue: teamMemberModel }],
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sortRoleComparator', () => {
    it('should order by rank correctly', () => {
      const members = [
        new TeamMemberModel({ roles: [new TeamRoleModel({ rank: 1 }) as Ref<TeamRoleModel>] }),
        new TeamMemberModel({ roles: [new TeamRoleModel({ rank: 0 }) as Ref<TeamRoleModel>] }),
      ]
      expect((<TeamRoleModel>members[0].roles[0]).rank).toBe(1)
      expect((<TeamRoleModel>members[1].roles[0]).rank).toBe(0)
      members.sort(service.sortRoleComparator)
      expect((<TeamRoleModel>members[0].roles[0]).rank).toBe(0)
      expect((<TeamRoleModel>members[1].roles[0]).rank).toBe(1)
    })
  })

  describe('sortGroupComparator', () => {
    it('should order by rank correctly', () => {
      const members = [
        new TeamMemberModel({ group: new TeamGroupModel({ rank: 1 }) as Ref<TeamGroupModel> }),
        new TeamMemberModel({ group: new TeamGroupModel({ rank: 0 }) as Ref<TeamGroupModel> }),
      ]
      expect((<TeamGroupModel>members[0].group).rank).toBe(1)
      expect((<TeamGroupModel>members[1].group).rank).toBe(0)
      members.sort(service.sortGroupComparator)
      expect((<TeamGroupModel>members[0].group).rank).toBe(0)
      expect((<TeamGroupModel>members[1].group).rank).toBe(1)
    })
  })
})
