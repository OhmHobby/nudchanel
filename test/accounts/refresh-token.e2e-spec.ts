import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Accounts - refresh token', () => {
  let app: INestApplication
  let mockRefreshTokenModel: MockModelType<typeof RefreshTokenModel>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockRefreshTokenModel = await app.get(getModelToken(RefreshTokenModel.name))
    resetMockModel(mockRefreshTokenModel)
  })

  it('POST /api/v1/accounts/refresh-token (success)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(refreshToken) })
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken._id!.toString()).build()

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/refresh-token')
      .set('Cookie', cookies)
      .send()

    expect(result.status).toBe(HttpStatus.NO_CONTENT)
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /ping (should not re-new when accessToken is valid)', async () => {
    const accessToken = await TestData.aValidAccessToken().build()
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(refreshToken) })
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(accessToken)
      .withRefreshToken(refreshToken._id!.toString())
      .build()

    const result = await request(app.getHttpServer()).get('/ping').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.text).toBe('pong')
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  it('GET /ping (automatically re-new expired accessToken)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(refreshToken) })
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(TestData.anExpiredAccessToken)
      .withRefreshToken(refreshToken._id!.toString())
      .build()

    const result = await request(app.getHttpServer()).get('/ping').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.text).toBe('pong')
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /ping (automatically re-new missing accessToken)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(refreshToken) })
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken._id!.toString()).build()

    const result = await request(app.getHttpServer()).get('/ping').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.text).toBe('pong')
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/access_token=.+/))
    expect(result.headers['set-cookie']).toContainEqual(expect.stringMatching(/refresh_token=.+/))
  })

  it('GET /ping (expired refresh token should not be re-newed)', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()
    mockRefreshTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })
    const cookies = TestData.aValidSupertestCookies().withRefreshToken(refreshToken._id!.toString()).build()

    const result = await request(app.getHttpServer()).get('/ping').set('Cookie', cookies).send()

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.text).toBe('pong')
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  afterAll(() => {
    app.close()
  })
})
