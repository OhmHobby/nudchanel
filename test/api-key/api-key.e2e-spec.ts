import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { ApiKeyModel } from 'src/models/api-key.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'
import MUUID from 'uuid-mongodb'

describe('API Key', () => {
  let app: INestApplication
  let mockApiKeyModel: MockModelType<typeof ApiKeyModel>
  const apiKey = 'def91403-b5ba-4531-8ae7-56bf19af1ed3'

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockApiKeyModel = await app.get(getModelToken(ApiKeyModel.name))
    resetMockModel(mockApiKeyModel)
  })

  it('GET /api/v1/api-keys (unauthorized)', async () => {
    const result = await request(app.getHttpServer()).get('/api/v1/api-keys').set('x-api-key', apiKey)
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
  })

  it('GET /api/v1/api-keys (bad request - empty)', async () => {
    const result = await request(app.getHttpServer()).get('/api/v1/api-keys')
    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
  })

  it('GET /api/v1/api-keys (bad request - malformed)', async () => {
    const result = await request(app.getHttpServer()).get('/api/v1/api-keys').set('x-api-key', 'api-key')
    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
  })

  it('GET /api/v1/api-keys (ok)', async () => {
    mockApiKeyModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(new ApiKeyModel({ _id: MUUID.from(apiKey), service: 'test' })),
    })
    const result = await request(app.getHttpServer()).get('/api/v1/api-keys').set('x-api-key', apiKey).send()
    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body.id).toBe(apiKey)
    expect(result.body.service).toBe('test')
  })
})
