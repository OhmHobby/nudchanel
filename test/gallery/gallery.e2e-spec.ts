import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { GalleryActivityResponseModel } from 'src/gallery/dto/gallery-activity-response.model'
import { GalleryAlbumResponseModel } from 'src/gallery/dto/gallery-album-response.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'

describe('Gallery', () => {
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

  it('GET /api/v1/gallery/activities/:id', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const album = TestData.aValidGalleryAlbum().build()
    mockGalleryActivityModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(activity) })
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([album]),
    })

    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities/' + activity._id)
      .send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryActivityResponseModel = result.body

    expect(body.id).toBe(activity._id?.toString())
    expect(body.title).toBe(activity.title)
    expect(body.time).toBe(activity.time.getTime().toString())
    expect(body.tags).toEqual(activity.tags)
    expect(body.cover).toBe(activity.cover)
    expect(body.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${activity.cover}.jpg`)
    expect(body.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${activity.cover}.webp`)

    expect(body.albums?.at(0)?.id).toBe(album._id)
    expect(body.albums?.at(0)?.title).toBe(album.title)
    expect(body.albums?.at(0)?.cover).toBe(album.cover)
    expect(body.albums?.at(0)?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${album.cover}.jpg`)
    expect(body.albums?.at(0)?.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${album.cover}.webp`)
  })

  it('GET /api/v1/gallery/albums/:id', async () => {
    const album = TestData.aValidGalleryAlbum().build()
    mockGalleryAlbumModel.findById = jest.fn().mockReturnValue({
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
  })
})
