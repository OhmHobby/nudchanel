import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { verify } from 'argon2'
import { Types } from 'mongoose'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { TestData } from 'test/test-data'
import { ProfileNameService } from '../profile/profile-name.service'
import { UserLocalService } from './user-local.service'

jest.mock('../profile/profile-name.service')

describe(UserLocalService.name, () => {
  let service: UserLocalService
  let profileNameService: ProfileNameService
  const userLocalModel = getModelForClass(UserLocalModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLocalService,
        ProfileNameService,
        {
          provide: getModelToken(UserLocalModel.name),
          useValue: userLocalModel,
        },
      ],
    }).compile()

    service = module.get<UserLocalService>(UserLocalService)
    profileNameService = module.get(ProfileNameService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should find without condition', async () => {
      userLocalModel.find = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.findAll()
      expect(userLocalModel.find).toHaveBeenCalledWith()
    })
  })

  describe('findByUsername', () => {
    it('should findOne by username', async () => {
      const username = 'username'
      userLocalModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.findByUsername(username)
      expect(userLocalModel.findOne).toHaveBeenCalledWith({ username })
    })
  })

  describe('findByProfile', () => {
    it('should findOne by profile', async () => {
      const profile = new Types.ObjectId()
      userLocalModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.findByProfile(profile)
      expect(userLocalModel.findOne).toHaveBeenCalledWith({ profile })
    })
  })

  describe('getUsersHashedPassword', () => {
    it('should return hashed password when found', async () => {
      const hashedPassword = 'hashedPassword'
      userLocalModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ password: hashedPassword }),
      })
      const result = await service.getUsersHashedPassword('username')
      expect(result).toBe(hashedPassword)
    })

    it('should throw when user not found', async () => {
      userLocalModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.getUsersHashedPassword('username')).rejects.toThrow()
    })
  })

  describe('isUsernameExists', () => {
    it('should return true when user exists', async () => {
      userLocalModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) })
      const result = await service.isUsernameExists('username')
      expect(result).toBe(true)
    })

    it('should return false when user does not exist', async () => {
      userLocalModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) })
      const result = await service.isUsernameExists('username')
      expect(result).toBe(false)
    })
  })

  describe('usernameCleanUp', () => {
    it('should clean up correctly', () => {
      expect(service.usernameCleanUp(' ก Ab 3')).toBe('ab')
    })
  })

  describe('requestUsername', () => {
    const profileId = new Types.ObjectId()
    const profileName = new ProfileNameModel()

    beforeEach(() => {
      profileName.lang = 'en'
      profileName.firstname = 'Firstname'
      profileName.lastname = 'Lastname'
    })

    it('should error when username has already created', async () => {
      userLocalModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) })
      await expect(service.requestUsername(profileId)).rejects.toThrow()
    })

    it('should error when english fullname not found', async () => {
      profileNameService.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      await expect(service.requestUsername(profileId)).rejects.toThrow()
    })

    it('should error when fullname not complete', async () => {
      profileName.lastname = undefined
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      await expect(service.requestUsername(profileId)).rejects.toThrow()
    })

    it('should return expected username correctly', async () => {
      userLocalModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) })
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValue(false)
      const result = await service.requestUsername(profileId)
      expect(result).toBe('firstnamel')
    })

    it('should add more character if duplicate', async () => {
      userLocalModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) })
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false)
      const result = await service.requestUsername(profileId)
      expect(result).toBe('firstnamela')
    })

    it('should error when no available username', async () => {
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValue(true)
      await expect(service.requestUsername(profileId)).rejects.toThrowError()
    })
  })

  describe('hashPassword', () => {
    it('should hash with argon2', async () => {
      const plain = 'Plain-passw0rd!'
      const hashed = await service.hashPassword(plain)
      await expect(verify(hashed, plain)).resolves.toBe(true)
    })
  })

  describe('changePassword', () => {
    it('should update with hashed password', async () => {
      const hashedPassword = 'hashed-password'
      service.hashPassword = jest.fn().mockReturnValue(hashedPassword)
      userLocalModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn(),
      })
      await service.changePassword('username', 'password')
      expect(userLocalModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'username' },
        { password: hashedPassword, password_last_set: expect.any(Date) },
      )
    })
  })

  describe('create', () => {
    it('should create with hashed password', async () => {
      const profile = new Types.ObjectId()
      const hashedPassword = 'hashed-password'
      userLocalModel.create = jest.fn()
      service.hashPassword = jest.fn().mockReturnValue(hashedPassword)
      await service.create('username', 'password', profile)
      expect(userLocalModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'username',
          password: hashedPassword,
          profile,
        }),
      )
    })
  })

  describe(UserLocalService.prototype.signIn.name, () => {
    it('should return user when password matches', async () => {
      const user = TestData.aValidUserLocal().build()
      service.findByUsername = jest.fn().mockResolvedValue(user)
      const result = await service.signIn('username', 'nudchDev!123')
      expect(result).toEqual(user)
    })
  })
})
