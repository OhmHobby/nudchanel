import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import expect from 'expect'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { ProfileModel } from 'src/models/accounts/profile.model'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Accounts - refresh token', () => {
  let app: INestApplication
  let mockProfileRepository: ReturnModelType<typeof ProfileModel>
  let mockRefreshTokenRepository: Repository<RefreshTokenEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockProfileRepository = await app.get(getModelToken(ProfileModel.name))
    mockRefreshTokenRepository = await app.get(getRepositoryToken(RefreshTokenEntity))
    mockRefreshTokenRepository.save = jest.fn().mockImplementation((entity) => Promise.resolve(entity))
    mockRefreshTokenRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
    mockProfileRepository.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(TestData.aValidProfile().build()),
    })
  })

  it('POST /api/v1/accounts/refresh-token (success)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(refreshToken)
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken.id).build()

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/refresh-token')
      .set('Cookie', cookies)
      .send()

    expect(result.status).toBe(HttpStatus.NO_CONTENT)
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /api/v1/accounts/profiles/me (should not re-new when accessToken is valid)', async () => {
    const accessToken = await TestData.aValidAccessToken().build()
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(refreshToken)
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(accessToken)
      .withRefreshToken(refreshToken.id)
      .build()

    const result = await request(app.getHttpServer()).get('/api/v1/accounts/profiles/me').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual(expect.any(Object))
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  it('GET /api/v1/accounts/profiles/me (automatically re-new expired accessToken)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(refreshToken)
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(TestData.anExpiredAccessToken)
      .withRefreshToken(refreshToken.id)
      .build()

    const result = await request(app.getHttpServer()).get('/api/v1/accounts/profiles/me').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual(expect.any(Object))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /api/v1/accounts/profiles/me (automatically re-new missing accessToken)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(refreshToken)
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken.id).build()

    const result = await request(app.getHttpServer()).get('/api/v1/accounts/profiles/me').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual(expect.any(Object))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /api/v1/accounts/profiles/me (expired refresh token should not be re-newed)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(null)
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken.id).build()

    const result = await request(app.getHttpServer()).get('/api/v1/accounts/profiles/me').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  afterAll(() => {
    app.close()
  })
})
