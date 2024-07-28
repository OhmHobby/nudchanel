import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { GroupService } from '../group/group.service'
import { UserGroupService } from './user-group.service'

jest.mock('../group/group.service')

describe(UserGroupService.name, () => {
  let service: UserGroupService
  let groupService: GroupService
  const userGroupModel = getModelForClass(UserGroupModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupService,
        GroupService,
        {
          provide: getModelToken(UserGroupModel.name),
          useValue: userGroupModel,
        },
      ],
    }).compile()

    service = module.get<UserGroupService>(UserGroupService)
    groupService = module.get(GroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAllGroups', () => {
    it('should find from model correctly', async () => {
      userGroupModel.find = jest.fn().mockReturnValue({
        distinct: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      })
      groupService.getGroupsNames = jest.fn().mockResolvedValue([])
      await expect(service.getAllGroups()).resolves.toBeInstanceOf(Array)
      expect(groupService.getGroupsNames).toHaveBeenCalledWith([])
    })
  })

  describe('getProfileGroups', () => {
    it('should find from model correctly', async () => {
      userGroupModel.find = jest.fn().mockReturnValue({
        distinct: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      })
      groupService.getGroupsNames = jest.fn().mockResolvedValue([])
      await expect(service.getProfileGroups('profile-id')).resolves.toBeInstanceOf(Array)
      expect(groupService.getGroupsNames).toHaveBeenCalledWith([])
    })
  })

  describe('addGroups', () => {
    it('should insert document correctly', async () => {
      userGroupModel.insertMany = jest.fn().mockImplementation((docs) => Promise.resolve(docs))
      const groups = [1, 2]
      await expect(service.addGroups('profile-id', groups)).resolves.toHaveLength(groups.length)
    })
  })

  describe('removeGroups', () => {
    it('should delete document correctly', async () => {
      userGroupModel.deleteMany = jest.fn()
      await service.removeGroups('profile-id', [1])
      expect(userGroupModel.deleteMany).toBeCalled()
    })
  })

  describe('updateProfileGroups', () => {
    const profileId = 'profile-id'
    beforeEach(() => {
      service.removeGroups = jest.fn()
      service.addGroups = jest.fn()
    })

    it('should remove groups correctly', async () => {
      service.getProfileGroups = jest.fn().mockResolvedValue(['group0', 'group1', 'group2'])
      groupService.getGroupsIds = jest.fn().mockResolvedValueOnce([0, 2]).mockResolvedValueOnce([])
      await service.updateProfileGroups(profileId, ['group1'])
      expect(groupService.getGroupsIds).toHaveBeenCalledWith(['group0', 'group2'])
      expect(groupService.getGroupsIds).toHaveBeenCalledWith([])
      expect(service.removeGroups).toHaveBeenCalledWith(profileId, [0, 2])
      expect(service.addGroups).toHaveBeenCalledWith(profileId, [])
    })

    it('should add groups correctly', async () => {
      service.getProfileGroups = jest.fn().mockResolvedValue([])
      await service.updateProfileGroups('profile-id', ['group0', 'group1'])
      expect(groupService.create).toHaveBeenCalledWith('group0')
      expect(groupService.create).toHaveBeenCalledWith('group1')
      expect(groupService.getGroupsIds).toHaveBeenCalledWith([])
      expect(groupService.getGroupsIds).toHaveBeenCalledWith(['group0', 'group1'])
    })

    it('should add add remove groups correctly', async () => {
      service.getProfileGroups = jest.fn().mockResolvedValue(['group0', 'group1'])
      await service.updateProfileGroups('profile-id', ['group1', 'group2'])
      expect(groupService.getGroupsIds).toHaveBeenCalledWith(['group0'])
      expect(groupService.getGroupsIds).toHaveBeenCalledWith(['group2'])
    })
  })
})
