import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Gallery activity', () => {
  let app: INestApplication
  let mockGalleryActivityRepository: Repository<GalleryActivityEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockGalleryActivityRepository = await app.get(getRepositoryToken(GalleryActivityEntity))
  })

  test('GET /api/v1/gallery/activities', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    mockGalleryActivityRepository.find = jest.fn().mockResolvedValue([activity])
    const result = await request(app.getHttpServer()).get('/api/v1/gallery/activities').send()
    expect(result.status).toBe(HttpStatus.OK)
    expect(mockGalleryActivityRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
        }),
        take: 10,
      }),
    )
  })

  test('DELETE /api/v1/gallery/activities/AINfyH5', async () => {
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
    mockGalleryActivityRepository.softDelete = jest.fn().mockResolvedValue({ affected: 1 })
    const result = await request(app.getHttpServer()).delete('/api/v1/gallery/activities/AINfyH5').set('Cookie', cookie)
    expect(result.status).toBe(HttpStatus.NO_CONTENT)
  })

  afterAll(() => {
    app.close()
  })
})
