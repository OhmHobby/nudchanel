import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Accounts - sign-out', () => {
  let app: INestApplication
  let refreshTokenModel: MockModelType<typeof RefreshTokenModel>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    refreshTokenModel = await app.get(getModelToken(RefreshTokenModel.name))
    resetMockModel(refreshTokenModel)
  })

  it('POST /api/v1/accounts/sign-out', async () => {
    const refreshToken = TestData.aValidRefreshToken().build()._id!.toString()
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().build())
      .withRefreshToken(refreshToken)
      .build()

    const result = await request(app.getHttpServer()).post('/api/v1/accounts/sign-out').set('Cookie', cookies).send()
    const setCookie = result.headers['set-cookie']

    expect(result.status).toBe(HttpStatus.NO_CONTENT)
    expect(setCookie).toContainEqual(expect.stringMatching(/access_token=;.+Expires=Thu, 01 Jan 1970 00:00:00 GMT/))
    expect(setCookie).toContainEqual(expect.stringMatching(/refresh_token=;.+Expires=Thu, 01 Jan 1970 00:00:00 GMT/))
    expect(refreshTokenModel.deleteOne).toHaveBeenCalledWith({ _id: refreshToken })
  })

  afterAll(() => {
    app.close()
  })
})
