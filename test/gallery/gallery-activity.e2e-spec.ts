import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import expect from 'expect'
import { QueryWithHelpers } from 'mongoose'
import { GalleryActivityResponseModel } from 'src/gallery/dto/gallery-activity-response.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'
describe('Gallery activity', () => {
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

  it('GET /api/v1/gallery/activities?limit=10', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const query: Partial<QueryWithHelpers<any, any>> = {
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([activity]),
    }
    mockGalleryActivityModel.find = jest.fn().mockReturnValue(query)
    const result = await request(app.getHttpServer()).get('/api/v1/gallery/activities').query({ limit: 10 }).send()
    expect(result.status).toBe(HttpStatus.OK)
    expect(query.limit).toHaveBeenCalledWith(10)
    expect(query.where).toHaveBeenCalledWith(expect.objectContaining({ published: true }))
  })

  it('GET /api/v1/gallery/activities?limit=10&all=true (forbidden)', async () => {
    mockGalleryActivityModel.find = jest.fn()
    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities')
      .query({ limit: 10, all: true })
      .send()
    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    expect(mockGalleryActivityModel.find).not.toHaveBeenCalled()
  })

  it('GET /api/v1/gallery/activities?limit=10&all=true (ok)', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const query: Partial<QueryWithHelpers<any, any>> = {
      sort: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([activity]),
    }
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
      .build()
    mockGalleryActivityModel.find = jest.fn().mockReturnValue(query)
    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities')
      .query({ limit: 10, all: true })
      .set('Cookie', cookie)
      .send()
    expect(result.status).toBe(HttpStatus.OK)
    expect(query.where).not.toHaveBeenCalledWith(expect.objectContaining({ published: true }))
  })

  it('GET /api/v1/gallery/activities/:id', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const album = TestData.aValidGalleryAlbum().build()
    const albumQuery = {
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([album]),
    }
    mockGalleryActivityModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(activity) })
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue(albumQuery)

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
    expect(body.albums?.at(0)?.activity).toBeUndefined()

    expect(albumQuery.where).toHaveBeenCalledWith(expect.objectContaining({ published: true }))
  })

  it('GET /api/v1/gallery/activities/:id?all=true (forbidden)', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    mockGalleryActivityModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(activity) })
    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities/' + activity._id)
      .query({ all: true })
      .send()
    expect(result.status).toBe(HttpStatus.BAD_REQUEST)
  })

  it('GET /api/v1/gallery/activities/:id?all=true (ok)', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const albums = [
      TestData.aValidGalleryAlbum().withPublished(true).build(),
      TestData.aValidGalleryAlbum().withPublished(false).build(),
    ]
    const albumQuery = {
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(albums),
    }
    mockGalleryActivityModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(activity) })
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue(albumQuery)
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
      .build()

    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/activities/' + activity._id)
      .query({ all: true })
      .set('Cookie', cookie)
      .send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryActivityResponseModel = result.body

    expect(body.albums).toHaveLength(2)
    expect(albumQuery.where).not.toHaveBeenCalledWith(expect.objectContaining({ published: true }))
  })

  it('POST /api/v1/gallery/activities', async () => {
    const date = new Date('2024-02-28T07:00:00Z')
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
    const exampleActivity = TestData.aValidGalleryActivity().build()
    const result = await request(app.getHttpServer())
      .post('/api/v1/gallery/activities')
      .set('Cookie', cookie)
      .send({
        title: exampleActivity.title,
        time: date.toISOString(),
        tags: ['test', 'created'],
      })
    expect(result.status).toBe(HttpStatus.CREATED)
    expect(result.body).toEqual(
      expect.objectContaining({
        published: false,
        time: date.getTime().toString(),
        publishedAt: expect.any(String),
        cardUrl: 'https://photos.nudchannel.com/photos/card/00000000-0000-0000-0000-000000000000.webp',
        coverUrl: 'https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg',
        tags: ['test', 'created'],
      }),
    )
  })

  it('PUT /api/v1/gallery/activities/AINfyH5', async () => {
    const date = new Date('2024-02-28T07:00:00Z')
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
    const exampleActivity = TestData.aValidGalleryActivity().build()
    const result = await request(app.getHttpServer())
      .put('/api/v1/gallery/activities/AINfyH5')
      .set('Cookie', cookie)
      .send({
        title: exampleActivity.title,
        cover: exampleActivity.cover,
        published: true,
        time: date.toISOString(),
        publishedAt: date.toISOString(),
        tags: ['test', 'edited'],
      })
    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual(
      expect.objectContaining({
        cover: exampleActivity.cover,
        published: true,
        time: date.getTime().toString(),
        publishedAt: date.getTime().toString(),
        cardUrl: `https://photos.nudchannel.com/photos/card/${exampleActivity.cover}.webp`,
        coverUrl: `https://photos.nudchannel.com/photos/cover/${exampleActivity.cover}.jpg`,
        tags: ['test', 'edited'],
      }),
    )
  })

  it('DELETE /api/v1/gallery/activities/AINfyH5', async () => {
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
    const result = await request(app.getHttpServer()).delete('/api/v1/gallery/activities/AINfyH5').set('Cookie', cookie)
    expect(result.status).toBe(HttpStatus.NO_CONTENT)
  })

  afterAll(() => {
    app.close()
  })
})
