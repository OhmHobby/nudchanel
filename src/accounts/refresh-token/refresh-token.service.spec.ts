import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Types } from 'mongoose'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'
import { RefreshTokenService } from './refresh-token.service'

jest.mock('@nestjs/config')

describe(RefreshTokenService.name, () => {
  let service: RefreshTokenService
  const refreshTokenRepository: Partial<Repository<RefreshTokenEntity>> = { existsBy: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: getRepositoryToken(RefreshTokenEntity), useValue: refreshTokenRepository },
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
      refreshTokenRepository.existsBy = jest.fn().mockResolvedValue(true)
      await expect(service.isExpired('refresh-token')).resolves.toBe(false)
    })

    it('should expired when not found', async () => {
      refreshTokenRepository.existsBy = jest.fn().mockResolvedValue(false)
      await expect(service.isExpired('refresh-token')).resolves.toBe(true)
    })
  })

  describe('use', () => {
    beforeEach(() => {
      service.isSessionToken = jest.fn()
    })

    const profile = new Types.ObjectId()

    it('should create new refresh token when token valid without having been issue', async () => {
      const newRefreshToken = TestData.aValidRefreshToken().withUuid().build()
      service.shouldReIssue = jest.fn().mockReturnValue(true)
      service.find = jest.fn().mockResolvedValue(TestData.aValidRefreshToken().build())
      service.create = jest.fn().mockResolvedValue(newRefreshToken)
      service.revokeToken = jest.fn()
      const result = await service.use('refresh-token')
      expect(result?.id).toEqual(newRefreshToken.id)
      expect(service.revokeToken).toHaveBeenCalled()
    })

    it('should skip creating new refresh token when should re issue is false', async () => {
      const currentRefreshToken = TestData.aValidRefreshToken().withUuid().build()
      service.shouldReIssue = jest.fn().mockReturnValue(false)
      service.find = jest.fn().mockResolvedValue(currentRefreshToken)
      service.create = jest.fn()
      service.revokeToken = jest.fn()
      const result = await service.use('refresh-token')
      expect(result).toEqual(currentRefreshToken)
      expect(service.create).not.toHaveBeenCalled()
      expect(service.revokeToken).not.toHaveBeenCalled()
    })

    it('should return issued token when token already use in given period', async () => {
      const issuedRefreshToken = 'issued-refresh-token'
      service.find = jest.fn().mockResolvedValue({ profile, nextToken: issuedRefreshToken })
      service.create = jest.fn()
      service.revokeToken = jest.fn()
      const result = await service.use('refresh-token')
      expect(result?.id).toBe(issuedRefreshToken)
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

  describe('shouldReIssue', () => {
    it('should return true when token has been issued more than 7 hour ago', () => {
      const token = new RefreshTokenEntity({ createdAt: new Date('2025-06-03T07:00:00.000Z') })
      const result = service.shouldReIssue(token, new Date('2025-06-03T14:00:01.000Z'))
      expect(result).toBe(true)
    })

    it('should return false when token has been issued less than 7 hour ago', () => {
      const token = new RefreshTokenEntity({ createdAt: new Date('2025-06-03T07:00:00.000Z') })
      const result = service.shouldReIssue(token, new Date('2025-06-03T13:59:59.000Z'))
      expect(result).toBe(false)
    })
  })
})
