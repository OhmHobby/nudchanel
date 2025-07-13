import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { verify } from 'argon2'
import { Types } from 'mongoose'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { TestData } from 'test/test-data'
import { ProfileNameService } from '../profile/profile-name.service'
import { UserLocalService } from './user-local.service'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { BadRequestException, ForbiddenException } from '@nestjs/common'

jest.mock('../profile/profile-name.service')

describe(UserLocalService.name, () => {
  let service: UserLocalService
  let profileNameService: ProfileNameService
  let userLocalUserRepository: any

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLocalService,
        ProfileNameService,
        {
          provide: getRepositoryToken(UserLocalUserEntity),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UserLocalService>(UserLocalService)
    profileNameService = module.get(ProfileNameService)
    userLocalUserRepository = module.get(getRepositoryToken(UserLocalUserEntity))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should find without condition', async () => {
      userLocalUserRepository.find = jest.fn().mockResolvedValue([])
      await service.findAll()
      expect(userLocalUserRepository.find).toHaveBeenCalledWith()
    })
  })

  describe('findByUsername', () => {
    it('should findOne by username without password', async () => {
      const username = 'username'
      const mockUser = { username, id: '1', profileId: 'profile1' }
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue(mockUser)
      await service.findByUsername(username)
      expect(userLocalUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
          profileId: true,
          username: true,
          password: false,
          passwordLastSet: true,
          disabled: true,
        },
      })
    })

    it('should include password when requested', async () => {
      const username = 'username'
      const mockUser = { username, password: 'hashed', id: '1', profileId: 'profile1' }
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue(mockUser)
      await service.findByUsername(username, true)
      expect(userLocalUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
          profileId: true,
          username: true,
          password: true,
          passwordLastSet: true,
          disabled: true,
        },
      })
    })
  })

  describe('findByProfile', () => {
    it('should findOne by profile', async () => {
      const profile = new Types.ObjectId()
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue({ username: 'test' })
      await service.findByProfile(profile)
      expect(userLocalUserRepository.findOne).toHaveBeenCalledWith({
        where: { profileId: expect.any(String) },
      })
    })
  })

  describe('getUsersHashedPassword', () => {
    it('should return hashed password when found', async () => {
      const hashedPassword = 'hashedPassword'
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue({ password: hashedPassword })
      const result = await service.getUsersHashedPassword('username')
      expect(result).toBe(hashedPassword)
      expect(userLocalUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'username' },
        select: ['password'],
      })
    })

    it('should throw when user not found', async () => {
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue(null)
      await expect(service.getUsersHashedPassword('username')).rejects.toThrow('Username not found')
    })
  })

  describe('isUsernameExists', () => {
    it('should return true when user exists', async () => {
      userLocalUserRepository.count = jest.fn().mockResolvedValue(1)
      const result = await service.isUsernameExists('username')
      expect(result).toBe(true)
      expect(userLocalUserRepository.count).toHaveBeenCalledWith({ where: { username: 'username' } })
    })

    it('should return false when user does not exist', async () => {
      userLocalUserRepository.count = jest.fn().mockResolvedValue(0)
      const result = await service.isUsernameExists('username')
      expect(result).toBe(false)
    })
  })

  describe('usernameCleanUp', () => {
    it('should clean up correctly', () => {
      expect(service.usernameCleanUp(' ก Ab 3')).toBe('ab')
    })

    it('should handle undefined input', () => {
      expect(service.usernameCleanUp(undefined)).toBe(undefined)
    })

    it('should handle empty string', () => {
      expect(service.usernameCleanUp('')).toBe('')
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
      userLocalUserRepository.count = jest.fn().mockResolvedValue(1)
      await expect(service.requestUsername(profileId)).rejects.toThrow('Username has already created')
    })

    it('should error when english fullname not found', async () => {
      profileNameService.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      await expect(service.requestUsername(profileId)).rejects.toThrow('English fullname not found')
    })

    it('should error when fullname not complete', async () => {
      profileName.lastname = undefined
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      await expect(service.requestUsername(profileId)).rejects.toThrow('Fullname required')
    })

    it('should return expected username correctly', async () => {
      userLocalUserRepository.count = jest.fn().mockResolvedValue(0)
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValue(false)
      const result = await service.requestUsername(profileId)
      expect(result).toBe('firstnamel')
    })

    it('should add more character if duplicate', async () => {
      userLocalUserRepository.count = jest.fn().mockResolvedValue(0)
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false)
      const result = await service.requestUsername(profileId)
      expect(result).toBe('firstnamela')
    })

    it('should error when no available username', async () => {
      profileNameService.getProfileName = jest.fn().mockResolvedValue(profileName)
      service.isUsernameExists = jest.fn().mockResolvedValue(true)
      await expect(service.requestUsername(profileId)).rejects.toThrowError('No username available')
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
      userLocalUserRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
      await service.changePassword('username', 'password')
      expect(userLocalUserRepository.update).toHaveBeenCalledWith(
        { username: 'username' },
        { password: hashedPassword, passwordLastSet: expect.any(Date) },
      )
    })
  })

  describe('verifyAndChangePassword', () => {
    const profileId = new Types.ObjectId()
    const mockUser = { username: 'testuser', password: 'hashedPassword' }

    beforeEach(() => {
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue(mockUser)
    })

    it('should change password when current password is valid', async () => {
      service.changePassword = jest.fn().mockResolvedValue({ affected: 1 })
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true)
      await service.verifyAndChangePassword(profileId, 'currentPassword', 'newPassword')
      expect(service.changePassword).toHaveBeenCalledWith('testuser', 'newPassword')
      expect(userLocalUserRepository.findOne).toHaveBeenCalledWith({
        where: { profileId: expect.any(String) },
        select: ['username', 'password'],
      })
    })

    it('should throw ForbiddenException when user not found', async () => {
      userLocalUserRepository.findOne = jest.fn().mockResolvedValue(null)
      await expect(service.verifyAndChangePassword(profileId, 'currentPassword', 'newPassword')).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw BadRequestException when current password is invalid', async () => {
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(false)
      await expect(service.verifyAndChangePassword(profileId, 'wrongPassword', 'newPassword')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('create', () => {
    it('should create with hashed password', async () => {
      const profile = new Types.ObjectId()
      const hashedPassword = 'hashed-password'
      const mockUser = { username: 'username', password: hashedPassword }
      userLocalUserRepository.create = jest.fn().mockReturnValue(mockUser)
      userLocalUserRepository.save = jest.fn().mockResolvedValue(mockUser)
      service.hashPassword = jest.fn().mockReturnValue(hashedPassword)
      await service.create('username', 'password', profile)
      expect(userLocalUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'username',
          password: hashedPassword,
          profileId: expect.any(String),
        }),
      )
    })

    it('should create without profile', async () => {
      const hashedPassword = 'hashed-password'
      const mockUser = { username: 'username', password: hashedPassword }
      userLocalUserRepository.create = jest.fn().mockReturnValue(mockUser)
      userLocalUserRepository.save = jest.fn().mockResolvedValue(mockUser)
      service.hashPassword = jest.fn().mockReturnValue(hashedPassword)
      await service.create('username', 'password')
      expect(userLocalUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'username',
          password: hashedPassword,
          profileId: undefined,
        }),
      )
    })
  })

  describe('disableUser', () => {
    it('should disable user by default', async () => {
      userLocalUserRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
      await service.disableUser('username')
      expect(userLocalUserRepository.update).toHaveBeenCalledWith({ username: 'username' }, { disabled: true })
    })

    it('should enable user when disabled is false', async () => {
      userLocalUserRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
      await service.disableUser('username', false)
      expect(userLocalUserRepository.update).toHaveBeenCalledWith({ username: 'username' }, { disabled: false })
    })
  })

  describe('signIn', () => {
    it('should return user when password matches', async () => {
      const user = TestData.aValidUserLocal().build()
      service.findByUsername = jest.fn().mockResolvedValue(user)
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true)
      const result = await service.signIn('username', 'nudchDev!123')
      expect(result).toEqual(user)
    })

    it('should throw BadRequestException when user not found', async () => {
      service.findByUsername = jest.fn().mockResolvedValue(null)
      await expect(service.signIn('username', 'password')).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when user is disabled', async () => {
      const user = { ...TestData.aValidUserLocal().build(), disabled: true }
      service.findByUsername = jest.fn().mockResolvedValue(user)
      await expect(service.signIn('username', 'password')).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when password is invalid', async () => {
      const user = { ...TestData.aValidUserLocal().build(), password: 'wrongHash' }
      service.findByUsername = jest.fn().mockResolvedValue(user)
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(false)
      await expect(service.signIn('username', 'wrongPassword')).rejects.toThrow(BadRequestException)
    })
  })
})
