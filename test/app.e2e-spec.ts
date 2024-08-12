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
    const cookies = TestData.aValidSupertestCookies()
      .withAccessToken(
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmODU0ZWJmYzJkMTIzYjQ2NzE4MzA0MCIsImdyb3VwcyI6WyJudWRjaCIsIm51ZGNoXzIwMjIiLCJudWRjaF8yMDIxIiwiYWRtaW4iLCJpdCJdLCJuYW1lIjoiRGV2ZWxvcG1lbnQgVXNlciIsInBob3RvIjoiaHR0cHM6Ly93d3cubnVkY2hhbm5lbC5jb20vY292ZXIucG5nIiwiaWF0IjoxNzIzMzc0Nzg1LCJleHAiOjE3MjMzNzQ3ODUsImlzcyI6ImFjY291bnRzLm51ZGNoYW5uZWwuY29tIiwic3ViIjoiNWY4NTRlYmZjMmQxMjNiNDY3MTgzMDQwIn0.QkGY_uRNz5ISSd6DidI-EqVuCdaG3Mq1DeClJ8Vt2Fwy6cIRPYKjjB2RkDfo66M6a7PMBsKJ-4QPK9c_5yEHbA7vFnuJoO6a7n-AaAc87cDANOIgoJ5WKokpPtmjgfgoPemVvNBVXyaah0j7QE5c23ktT9Pk20uRp3YJSjXgDmmz0pYOrrhlcLT4ymb_ajuca0V4obj81bixvwmYDD3LiIERhpGJYeX-B0N-TfF0qCcZmQgZlciOaOOOwJhZ9NYjNjX_4NyDQ6JyVkbnTX5ciHyxG3NZMnfoYdQDtRWawcfb1HUdbCKkqFpUwUIHGKxkF9uuOpCEldr0Qxw9yvlYuA',
      )
      .build()
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
