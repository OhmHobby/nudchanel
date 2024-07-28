import { HttpStatus, INestApplication } from '@nestjs/common'
import { writeFile } from 'fs/promises'
import * as request from 'supertest'
import { TestData } from './test-data'

describe('Swagger', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  it('GET /swagger-json', async () => {
    const result = await request(app.getHttpServer()).get('/swagger-json').expect(HttpStatus.OK)
    await writeFile('./openapi.json', result.text, { encoding: 'utf8' })
  })

  it('GET /swagger-yaml', async () => {
    const result = await request(app.getHttpServer()).get('/swagger-yaml').expect(HttpStatus.OK)
    await writeFile('./openapi.yaml', result.text, { encoding: 'utf8' })
  })
})
