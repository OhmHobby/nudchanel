import { HttpStatus, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { TestData } from './test-data'

describe('App', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  it('GET /ping', () => {
    return request(app.getHttpServer()).get('/ping').expect(HttpStatus.OK).expect('pong')
  })

  it('GET /bullboard (Unauthorized)', () => {
    return request(app.getHttpServer()).get('/bullboard/').expect(HttpStatus.UNAUTHORIZED)
  })

  it('GET /bullboard (Expired token)', async () => {
    const cookies = TestData.aValidSupertestCookies().withAccessToken(TestData.anExpiredAccessToken).build()
    return await request(app.getHttpServer()).get('/bullboard/').set('Cookie', cookies).expect(HttpStatus.UNAUTHORIZED)
  })

  it('GET /bullboard (Forbidden)', async () => {
    const accessToken = await TestData.aValidAccessToken().build()
    const cookies = TestData.aValidSupertestCookies().withAccessToken(accessToken).build()
    return request(app.getHttpServer()).get('/bullboard/').set('Cookie', cookies).expect(HttpStatus.FORBIDDEN)
  })

  afterAll(() => {
    app.close()
  })
})
