import { HttpStatus, INestApplication } from '@nestjs/common'
import { writeFile } from 'fs/promises'
import request from 'supertest'
import { TestData } from './test-data'

describe('Swagger', () => {
  let app: INestApplication
  let accessToken: string

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
    accessToken = await TestData.aValidAccessToken().withGroups('nudch').build()
  })

  it('GET /swagger-json', async () => {
    const result = await request(app.getHttpServer())
      .get('/swagger-json')
      .set('Cookie', 'access_token=' + accessToken)
      .expect(HttpStatus.OK)
    await writeFile('./openapi.json', result.text, { encoding: 'utf8' })
  }, 15000)

  it('GET /swagger-yaml', async () => {
    const result = await request(app.getHttpServer())
      .get('/swagger-yaml')
      .set('Cookie', 'access_token=' + accessToken)
      .expect(HttpStatus.OK)
    await writeFile('./openapi.yaml', result.text, { encoding: 'utf8' })
  }, 15000)

  it('GET /swagger (Unauthorization)', async () => {
    await request(app.getHttpServer()).get('/swagger').expect(HttpStatus.UNAUTHORIZED)
  })

  afterAll(async () => {
    await app.close()
  })
})
