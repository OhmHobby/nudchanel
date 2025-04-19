import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Accounts - sign-out', () => {
  let app: INestApplication
  let refreshTokenRepository: Repository<RefreshTokenEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    refreshTokenRepository = await app.get(getRepositoryToken(RefreshTokenEntity))
    refreshTokenRepository.delete = jest.fn().mockResolvedValue({ affected: 1 })
  })

  it('POST /api/v1/accounts/sign-out', async () => {
    const refreshToken = TestData.aValidRefreshToken().build().id
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().build())
      .withRefreshToken(refreshToken)
      .build()

    const result = await request(app.getHttpServer()).post('/api/v1/accounts/sign-out').set('Cookie', cookies).send()
    const setCookie = result.headers['set-cookie']

    expect(result.status).toBe(HttpStatus.NO_CONTENT)
    expect(setCookie).toContainEqual(expect.stringMatching(/access_token=;.+Expires=Thu, 01 Jan 1970 00:00:00 GMT/))
    expect(setCookie).toContainEqual(expect.stringMatching(/refresh_token=;.+Expires=Thu, 01 Jan 1970 00:00:00 GMT/))
    expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ id: refreshToken })
  })

  afterAll(() => {
    app.close()
  })
})
