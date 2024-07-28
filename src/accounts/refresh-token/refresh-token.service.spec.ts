import { getModelToken } from '@m8a/nestjs-typegoose'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { RefreshTokenService } from './refresh-token.service'

jest.mock('@nestjs/config')

describe(RefreshTokenService.name, () => {
  let service: RefreshTokenService
  const refreshTokenModel = getModelForClass(RefreshTokenModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getModelToken('RefreshTokenModel'),
          useValue: refreshTokenModel,
        },
        ConfigService,
      ],
    }).compile()

    service = module.get<RefreshTokenService>(RefreshTokenService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('refreshTokenExpires', () => {
    it('should return date type', () => {
      expect(service.refreshTokenExpires()).toBeInstanceOf(Date)
      expect(service.refreshTokenExpires(true)).toBeInstanceOf(Date)
    })
  })

  describe('create', () => {
    it('should create correctly', async () => {
      const profileId = '0'
      refreshTokenModel.create = jest.fn().mockImplementation((arg) => Promise.resolve(arg))
      const result = await service.create(profileId)
      expect(typeof result).toBe('string')
    })
  })

  describe('update', () => {
    it('should call updateOne correctly', async () => {
      refreshTokenModel.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      })
      const result = await service.update('refresh-token', new Date(), 'new-token')
      expect(result).toBe(true)
    })
  })

  describe('remove', () => {
    it('should call deleteOne correctly', async () => {
      refreshTokenModel.deleteOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      })
      const result = await service.remove('refresh-token')
      expect(result).toBe(true)
    })
  })

  describe('find', () => {
    it('should call findOne correctly', async () => {
      refreshTokenModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.find('refresh-token')).resolves.toBeNull()
    })
  })

  describe('revokeToken', () => {
    beforeEach(() => {
      service.update = jest.fn()
      service.remove = jest.fn()
    })

    it('should remove token when no new token provided', async () => {
      await service.revokeToken('refresh-token')
      expect(service.update).not.toHaveBeenCalled()
      expect(service.remove).toHaveBeenCalled()
    })

    it('should update token when new token provided', async () => {
      await service.revokeToken('refresh-token', 'new-refresh-token')
      expect(service.update).toHaveBeenCalled()
      expect(service.remove).not.toHaveBeenCalled()
    })
  })

  describe('isExpired', () => {
    it('should not expired when found', async () => {
      refreshTokenModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      })

      await expect(service.isExpired('refresh-token')).resolves.toBe(false)
    })

    it('should expired when not found', async () => {
      refreshTokenModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      })

      await expect(service.isExpired('refresh-token')).resolves.toBe(true)
    })
  })

  describe('use', () => {
    beforeEach(() => {
      service.isSessionToken = jest.fn()
    })

    const profile = new Types.ObjectId()

    it('should create new refresh token when token valid without having been issue', async () => {
      const newRefreshToken = 'new-refresh-token'
      service.find = jest.fn().mockResolvedValue({
        profile,
      })
      service.create = jest.fn().mockResolvedValue(newRefreshToken)
      service.revokeToken = jest.fn()
      const result = await service.use('refresh-token')
      expect(result?._id).toBe(newRefreshToken)
      expect(service.revokeToken).toHaveBeenCalled()
    })

    it('should return issued token when token already use in given period', async () => {
      const issuedRefreshToken = 'issued-refresh-token'
      service.find = jest.fn().mockResolvedValue({
        profile,
        new_token: issuedRefreshToken,
      })
      service.create = jest.fn()
      service.revokeToken = jest.fn()
      const result = await service.use('refresh-token')
      expect(result?._id).toBe(issuedRefreshToken)
      expect(service.create).not.toHaveBeenCalled()
      expect(service.revokeToken).not.toHaveBeenCalled()
    })

    it('should return null when token invalid', async () => {
      service.find = jest.fn().mockResolvedValue(null)
      service.create = jest.fn()
      const result = await service.use('refresh-token')
      expect(result).toBe(null)
      expect(service.create).not.toHaveBeenCalled()
    })
  })

  describe('isSessionToken', () => {
    const createdAt = new Date('2022-01-01T00:00:59.999Z')

    it.each([[new Date('2022-01-01T00:14:00.000Z')], [new Date('2022-01-01T00:16:00.000Z')]])(
      'should return true when expires near session duration (%s)',
      (expiresAt) => {
        const result = service.isSessionToken(createdAt, expiresAt)
        expect(result).toBe(true)
      },
    )

    it.each([[new Date('2022-01-31T23:59:00.000Z')], [new Date('2022-02-01T00:00:00.999Z')]])(
      'should return false when diff more than 1 minute (%s)',
      (expiresAt) => {
        const result = service.isSessionToken(createdAt, expiresAt)
        expect(result).toBe(false)
      },
    )
  })
})
