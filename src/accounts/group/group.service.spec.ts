import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { GroupModel } from 'src/models/accounts/group.model'
import { GroupService } from './group.service'

describe(GroupService.name, () => {
  let service: GroupService
  const groupModel = getModelForClass(GroupModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, { provide: getModelToken(GroupModel.name), useValue: groupModel }],
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getGroupsNames', () => {
    it('should find name with id', async () => {
      groupModel.find = jest.fn().mockReturnValue({
        distinct: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      })
      await expect(service.getGroupsNames([])).resolves.toEqual([])
    })
  })

  describe('getGroupsIds', () => {
    it('should find id with name', async () => {
      groupModel.find = jest.fn().mockReturnValue({
        distinct: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      })
      await expect(service.getGroupsIds([])).resolves.toEqual([])
    })
  })

  describe('findById', () => {
    it('should find by id', async () => {
      groupModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn(),
      })
      await service.findById(1)
      expect(groupModel.findById).toHaveBeenCalled()
    })
  })

  describe('findByName', () => {
    it('should find one', async () => {
      groupModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn(),
      })
      await service.findByName('group-name')
      expect(groupModel.findOne).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    beforeEach(() => {
      groupModel.create = jest.fn()
    })

    it('should insert if not exist', async () => {
      service.findByName = jest.fn().mockResolvedValue(null)
      await service.create('name')
      expect(groupModel.create).toBeCalled()
    })

    it('should return existing when found', async () => {
      service.findByName = jest.fn().mockResolvedValue(new GroupModel())
      const result = await service.create('name')
      expect(result).toBeInstanceOf(GroupModel)
      expect(groupModel.create).not.toBeCalled()
    })
  })
})
