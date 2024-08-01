import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Gallery - activity', () => {
  let app: INestApplication
  let mockGalleryActivityModel: MockModelType<typeof GalleryActivityModel>
  let mockGalleryAlbumModel: MockModelType<typeof GalleryAlbumModel>
  let mockYouTubeVideoModel: MockModelType<typeof YouTubeVideoModel>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockGalleryActivityModel = await app.get(getModelToken(GalleryActivityModel.name))
    mockGalleryAlbumModel = await app.get(getModelToken(GalleryAlbumModel.name))
    mockYouTubeVideoModel = await app.get(getModelToken(YouTubeVideoModel.name))
    resetMockModel(mockGalleryActivityModel)
    resetMockModel(mockGalleryAlbumModel)
    resetMockModel(mockYouTubeVideoModel)
  })

  it('GET /api/v1/gallery/activity/:id', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    mockGalleryActivityModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(activity) })
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([TestData.aValidGalleryAlbum().build()]),
    })

    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities/' + activity._id)
      .send()

    expect(result.status).toBe(HttpStatus.OK)
  })
})
