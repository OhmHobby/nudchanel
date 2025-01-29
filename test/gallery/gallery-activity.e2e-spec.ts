import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Gallery activity', () => {
  let app: INestApplication
  let mockGalleryAlbumModel: MockModelType<typeof GalleryAlbumModel>
  let mockYouTubeVideoModel: MockModelType<typeof YouTubeVideoModel>
  let mockGalleryActivityRepository: Repository<GalleryActivityEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockGalleryAlbumModel = await app.get(getModelToken(GalleryAlbumModel.name))
    mockYouTubeVideoModel = await app.get(getModelToken(YouTubeVideoModel.name))
    mockGalleryActivityRepository = await app.get(getRepositoryToken(GalleryActivityEntity))
    resetMockModel(mockGalleryAlbumModel)
    resetMockModel(mockYouTubeVideoModel)
  })

  test('GET /api/v1/gallery/activities', async () => {
    const activity = TestData.aValidGalleryActivity().buildEntity()
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
