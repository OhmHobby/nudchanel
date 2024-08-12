import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Accounts - sign-in', () => {
  let app: INestApplication
  let mockUserLocalModel: MockModelType<typeof UserLocalModel>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockUserLocalModel = await app.get(getModelToken(UserLocalModel.name))
    resetMockModel(mockUserLocalModel)
  })

  it('POST /api/v1/accounts/sign-in/local (success)', async () => {
    mockUserLocalModel.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().build()),
    })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'password' })

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.headers['set-cookie']).toContainEqual(expect.stringContaining('access_token=eyJ'))
    expect(result.headers['set-cookie']).toContainEqual(
      expect.stringMatching(/refresh_token=\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/),
    )
  })

  it('POST /api/v1/accounts/sign-in/local (invalid password)', async () => {
    mockUserLocalModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().build()) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'secret' })

    expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  it('POST /api/v1/accounts/sign-in/local (user not found)', async () => {
    mockUserLocalModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'password' })

    expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  it('POST /api/v1/accounts/sign-in/local (disabled user)', async () => {
    mockUserLocalModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().withDisabled(true).build()) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'password' })

    expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  afterAll(() => {
    app.close()
  })
})
