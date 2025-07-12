import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { AuthProviderResponseModel } from 'src/accounts/models/auth-provider.response.model'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Accounts - sign-in', () => {
  let app: INestApplication
  let mockUserLocalModel: MockModelType<typeof UserLocalModel>
  let mockProfileModel: MockModelType<typeof ProfileModel>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockUserLocalModel = await app.get(getModelToken(UserLocalModel.name))
    resetMockModel(mockUserLocalModel)
    mockProfileModel = await app.get(getModelToken(ProfileModel.name))
    resetMockModel(mockProfileModel)
  })

  test('POST /api/v1/accounts/sign-in/local (success)', async () => {
    mockUserLocalModel.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().build()),
    })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'nudchDev!123' })

    expect(result.status).toBe(HttpStatus.OK)
    expect(result.headers['set-cookie']).toContainEqual(expect.stringContaining('access_token=eyJ'))
    expect(result.headers['set-cookie']).toContainEqual(
      expect.stringMatching(/refresh_token=\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/),
    )
  })

  test('POST /api/v1/accounts/sign-in/local (invalid password)', async () => {
    mockUserLocalModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().build()) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'Nudchdev!123' })

    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  test('POST /api/v1/accounts/sign-in/local (user not found)', async () => {
    mockUserLocalModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'nudchDev!123' })

    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  test('POST /api/v1/accounts/sign-in/local (disabled user)', async () => {
    mockUserLocalModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(TestData.aValidUserLocal().withDisabled(true).build()) })

    const result = await request(app.getHttpServer())
      .post('/api/v1/accounts/sign-in/local')
      .send({ username: 'username', password: 'nudchDev!123' })

    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    expect(result.headers['set-cookie']).toBeUndefined()
  })

  test('GET /api/v1/accounts/sign-in/providers', async () => {
    const result = await request(app.getHttpServer())
      .get('/api/v1/accounts/sign-in/providers')
      .set('Host', 'dev.nudchannel.com')
    expect(result.body).toContainEqual(
      new AuthProviderResponseModel({
        provider: OidcProvider.Google,
        url: 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=email&redirect_uri=http%3A%2F%2Fdev.nudchannel.com%2Fapi%2Fv1%2Faccounts%2Fsign-in%2Fgoogle%2Fcallback&response_type=code&client_id=1083281018269-fvqevf7hgj2svu0m431anvq5ldofud8d.apps.googleusercontent.com',
      }),
    )
    expect(result.body).toContainEqual(
      new AuthProviderResponseModel({
        provider: OidcProvider.Discord,
        url: 'https://discord.com/api/v10/oauth2/authorize?client_id=1095379875226988664&response_type=code&scope=identify+email&redirect_uri=http%3A%2F%2Fdev.nudchannel.com%2Fapi%2Fv1%2Faccounts%2Fsign-in%2Fdiscord%2Fcallback',
      }),
    )
  })

  test('GET /api/v1/accounts/sign-in/discord/callback (sign-in)', async () => {
    mockProfileModel.findOne = jest.fn().mockReturnValue({
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(TestData.aValidProfile().build()),
    })
    const result = await request(app.getHttpServer())
      .get('/api/v1/accounts/sign-in/discord/callback?code=test')
      .set('Cookie', ['continue_path=/home'])
    expect(result.statusCode).toBe(HttpStatus.FOUND)
    expect(result.header['location']).toBe('/home')
    expect(result.headers['set-cookie']).toContainEqual(expect.stringContaining('access_token=eyJ'))
    expect(result.headers['set-cookie']).toContainEqual(
      expect.stringMatching(/refresh_token=\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/),
    )
  })

  afterAll(() => {
    app.close()
  })
})
