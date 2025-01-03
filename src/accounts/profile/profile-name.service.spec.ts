import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { ProfileNameService } from './profile-name.service'
import { TeamService } from '../team/team.service'

jest.mock('../team/team.service')

describe(ProfileNameService.name, () => {
  let service: ProfileNameService
  let profileTeamService: TeamService
  const profileNameModel = getModelForClass(ProfileNameModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileNameService,
        TeamService,
        { provide: getModelToken(ProfileNameModel.name), useValue: profileNameModel },
      ],
    }).compile()

    service = module.get(ProfileNameService)
    profileTeamService = module.get(TeamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(ProfileNameService.prototype.findProfile.name, () => {
    const find = {
      or: jest.fn(),
      where: jest.fn(),
      distinct: jest.fn(),
      exec: jest.fn(),
    }

    beforeEach(() => {
      find.or.mockReturnThis()
      find.where.mockReturnThis()
      find.distinct.mockReturnThis()
      find.exec.mockResolvedValue([])
      profileNameModel.find = jest.fn().mockReturnValue(find)
    })

    it('should find with empty condition when no search string provide', async () => {
      await service.findProfile()
      expect(profileNameModel.find).toHaveBeenCalled()
    })

    it('should find condition when search string provided', async () => {
      await service.findProfile('name', [])
      expect(find.or).toHaveBeenCalled()
      expect(find.where).not.toHaveBeenCalled()
      expect(find.distinct).toHaveBeenCalled()
      expect(find.exec).toHaveBeenCalled()
    })

    it('should find condition when id provided', async () => {
      await service.findProfile('name', [new Types.ObjectId()])
      expect(find.or).toHaveBeenCalled()
      expect(find.where).toHaveBeenCalled()
      expect(find.distinct).toHaveBeenCalled()
      expect(find.exec).toHaveBeenCalled()
    })
  })

  describe(ProfileNameService.prototype.getFallbackProfileName.name, () => {
    const profileId = new Types.ObjectId()

    it('should return value when found', async () => {
      profileNameModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ lang: 'th' }),
      })

      const result = await service.getProfileName(profileId)
      expect(result.lang).toBe('th')
    })

    it('should return default when profile not found', async () => {
      profileNameModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(undefined),
      })

      const result = await service.getProfileName(profileId)
      expect(result).toBeInstanceOf(ProfileNameModel)
    })
  })

  describe(ProfileNameService.prototype.getProfileName.name, () => {
    const profileId = new Types.ObjectId()

    beforeEach(() => {
      service.getFallbackProfileName = jest.fn()
    })

    it('should return first element of array', async () => {
      profileNameModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ lang: 'th' }),
      })

      const result = await service.getProfileName(profileId)
      expect(result.lang).toBe('th')
      expect(service.getFallbackProfileName).not.toHaveBeenCalled()
    })

    it('should return fallback profile name', async () => {
      profileNameModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(undefined),
      })

      await service.getProfileName(profileId)

      expect(service.getFallbackProfileName).toHaveBeenCalled()
    })
  })

  describe(ProfileNameService.prototype.getNickNameWithInitials.name, () => {
    it('should return null when no profile found', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(null)
      const result = await service.getNickNameWithInitials(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return null when no en name', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      const result = await service.getNickNameWithInitials(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return correctly', async () => {
      const profileName = new ProfileNameModel()
      profileName.firstname = 'accounts'
      profileName.lastname = 'user'
      profileName.nickname = 'tEst '
      profileName.lang = 'en'
      service.getProfileName = jest.fn().mockResolvedValue(profileName)
      const result = await service.getNickNameWithInitials(new Types.ObjectId())
      expect(result).toBe('TestAU')
    })
  })

  describe(ProfileNameService.prototype.getNickNameWithFirstNameAndInitial, () => {
    it('should return null when no profile found', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(null)
      const result = await service.getNickNameWithFirstNameAndInitial(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return null when no en name', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      const result = await service.getNickNameWithFirstNameAndInitial(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return correctly', async () => {
      const profileName = new ProfileNameModel()
      profileName.firstname = 'abcdefghijklmnopqrstuvwxyz'
      profileName.lastname = 'user'
      profileName.nickname = 'tEst '
      profileName.lang = 'en'
      service.getProfileName = jest.fn().mockResolvedValue(profileName)
      const result = await service.getNickNameWithFirstNameAndInitial(new Types.ObjectId())
      expect(result).toHaveLength(32)
      expect(result).toBe('(Test) AbcdefghijklmnopqrstuvwxU')
    })
  })

  describe(ProfileNameService.prototype.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix, () => {
    it('should return null when no profile found', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(null)
      const result = await service.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return null when no en name', async () => {
      service.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      const result = await service.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(new Types.ObjectId())
      expect(result).toBeNull()
    })

    it('should return with emoji correctly', async () => {
      const profileName = new ProfileNameModel()
      profileName.firstname = 'abcdefghijklmnopqrstuvwxyz'
      profileName.lastname = 'user'
      profileName.nickname = 'tEst '
      profileName.lang = 'en'
      service.getProfileName = jest.fn().mockResolvedValue(profileName)
      profileTeamService.getLatestProfileTeamEmoji = jest.fn().mockResolvedValue('💻')
      const result = await service.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(new Types.ObjectId())
      expect(result).toHaveLength(32)
      expect(result).toBe('💻 (Test) AbcdefghijklmnopqrstuU') // 1 emoji => 2 characters
    })

    it('should return without emoji correctly', async () => {
      const profileName = new ProfileNameModel()
      profileName.firstname = 'abcdefghijklmnopqrstuvwxyz'
      profileName.lastname = 'user'
      profileName.nickname = 'tEst '
      profileName.lang = 'en'
      service.getProfileName = jest.fn().mockResolvedValue(profileName)
      profileTeamService.getLatestProfileTeamEmoji = jest.fn().mockResolvedValue(undefined)
      const result = await service.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(new Types.ObjectId())
      expect(result).toHaveLength(32)
      expect(result).toBe('(Test) AbcdefghijklmnopqrstuvwxU')
    })
  })

  describe(ProfileNameService.prototype.upsert.name, () => {
    it('should call findOneAndUpdate correctly', async () => {
      profileNameModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn() })
      const lang = 'en'
      const profileId = new Types.ObjectId()
      const firstname = 'test'
      await service.upsert(lang, profileId, { firstname })
      expect(profileNameModel.findOneAndUpdate).toHaveBeenCalledWith(
        { lang, profile: profileId },
        {
          lang,
          profile: profileId,
          firstname,
        },
        { new: true, upsert: true },
      )
    })
  })
})
