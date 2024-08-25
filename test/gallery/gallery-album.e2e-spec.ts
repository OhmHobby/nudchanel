import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { GalleryAlbumResponseModel } from 'src/gallery/dto/gallery-album-response.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Gallery album', () => {
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

  it('GET /api/v1/gallery/albums/:id', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const album = TestData.aValidGalleryAlbum().withActivity(activity).build()
    mockGalleryAlbumModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(album),
    })

    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/albums/' + album._id)
      .send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryAlbumResponseModel = result.body

    expect(body?.id).toBe(album._id)
    expect(body?.title).toBe(album.title)
    expect(body?.cover).toBe(album.cover)
    expect(body?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${album.cover}.jpg`)
    expect(body?.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${album.cover}.webp`)
    expect(body?.activity?.id).toBe(activity._id)
    expect(body?.activity?.title).toBe(activity.title)
    expect(body?.activity?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${activity.cover}.jpg`)
  })

  afterAll(() => {
    app.close()
  })
})
