import { getModelToken } from '@m8a/nestjs-typegoose'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { GalleryAlbumResponseModel } from 'src/gallery/dto/gallery-album-response.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import request from 'supertest'
import { MockModelType, resetMockModel } from 'test/helpers/mock-model'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Gallery album', () => {
  let app: INestApplication
  let mockGalleryActivityModel: MockModelType<typeof GalleryActivityModel>
  let mockGalleryAlbumModel: MockModelType<typeof GalleryAlbumModel>
  let mockYouTubeVideoModel: MockModelType<typeof YouTubeVideoModel>
  let mockGalleryActivityRepository: Repository<GalleryActivityEntity>
  let prCookie: string[]

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
    prCookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
  })

  beforeEach(async () => {
    mockGalleryActivityModel = await app.get(getModelToken(GalleryActivityModel.name))
    mockGalleryAlbumModel = await app.get(getModelToken(GalleryAlbumModel.name))
    mockYouTubeVideoModel = await app.get(getModelToken(YouTubeVideoModel.name))
    mockGalleryActivityRepository = await app.get(getRepositoryToken(GalleryActivityEntity))
    resetMockModel(mockGalleryActivityModel)
    resetMockModel(mockGalleryAlbumModel)
    resetMockModel(mockYouTubeVideoModel)
  })

  test('GET /api/v1/gallery/albums', async () => {
    const album = TestData.aValidGalleryAlbum().build()
    const albumQuery = {
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([album]),
    }
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue(albumQuery)

    const result = await request(app.getHttpServer()).get('/api/v1/gallery/albums?activityId=AINfyH5').send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryAlbumResponseModel[] = result.body

    expect(body?.at(0)?.id).toBe(album._id)
    expect(body?.at(0)?.cover).toBe(album.cover)
    expect(body?.at(0)?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${album.cover}.jpg`)
    expect(body?.at(0)?.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${album.cover}.webp`)
    expect(body?.at(0)?.activity).toBeUndefined()
  })

  test('GET /api/v1/gallery/albums/:id', async () => {
    const activity = TestData.aValidGalleryActivity().buildEntity()
    const album = TestData.aValidGalleryAlbum().build()
    mockGalleryActivityRepository.findOneBy = jest.fn().mockResolvedValue(activity)
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
    expect(body?.activity?.id).toBe(activity.id)
    expect(body?.activity?.title).toBe(activity.title)
    expect(body?.activity?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${activity.cover}.jpg`)
  })

  describe('POST /api/v1/gallery/albums', () => {
    test(`${HttpStatus.OK} OK`, async () => {
      const activity = TestData.aValidGalleryActivity().build()
      const exampleAlbum = TestData.aValidGalleryAlbum().build()
      const result = await request(app.getHttpServer())
        .post('/api/v1/gallery/albums?activityId=' + activity._id)
        .set('Cookie', prCookie)
        .send({ title: exampleAlbum.title })
      expect(result.status).toBe(HttpStatus.CREATED)
      expect(result.body).toEqual(
        expect.objectContaining({
          title: exampleAlbum.title,
          published: false,
          publishedAt: expect.any(String),
          cardUrl: 'https://photos.nudchannel.com/photos/card/00000000-0000-0000-0000-000000000000.webp',
          coverUrl: 'https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg',
        }),
      )
    })

    test(`${HttpStatus.BAD_REQUEST} BAD_REQUEST - Missing activityId`, async () => {
      const result = await request(app.getHttpServer())
        .post('/api/v1/gallery/albums')
        .set('Cookie', prCookie)
        .send({ title: 'test' })
      expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    })

    test(`${HttpStatus.UNAUTHORIZED} UNAUTHORIZED`, async () => {
      const result = await request(app.getHttpServer())
        .post('/api/v1/gallery/albums?activityId=test')
        .send({ title: 'test' })
      expect(result.status).toBe(HttpStatus.UNAUTHORIZED)
    })
  })

  test('PUT /api/v1/gallery/albums/PNBwEli', async () => {
    const date = new Date('2024-02-28T07:00:00Z')
    const cookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
    const exampleAlbum = TestData.aValidGalleryAlbum().build()
    const result = await request(app.getHttpServer()).put('/api/v1/gallery/albums/PNBwEli').set('Cookie', cookie).send({
      title: exampleAlbum.title,
      cover: exampleAlbum.cover,
      published: true,
      publishedAt: date.toISOString(),
    })
    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual(
      expect.objectContaining({
        title: exampleAlbum.title,
        cover: exampleAlbum.cover,
        published: true,
        publishedAt: date.toISOString(),
        cardUrl: `https://photos.nudchannel.com/photos/card/${exampleAlbum.cover}.webp`,
        coverUrl: `https://photos.nudchannel.com/photos/cover/${exampleAlbum.cover}.jpg`,
      }),
    )
  })

  test('PUT /api/v1/gallery/albums/rank', async () => {
    mockGalleryAlbumModel.find = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest
        .fn()
        .mockResolvedValue([
          TestData.aValidGalleryAlbum().withId('album-1').build(),
          TestData.aValidGalleryAlbum().withId('album-2').build(),
          TestData.aValidGalleryAlbum().withId('album-3').build(),
          TestData.aValidGalleryAlbum().withId('album-4').build(),
          TestData.aValidGalleryAlbum().withId('album-5').build(),
        ]),
    })
    const result = await request(app.getHttpServer())
      .put('/api/v1/gallery/albums/rank?activityId=AINfyH5')
      .set('Cookie', prCookie)
      .send({ albumIds: ['album-3', 'album-2', 'album-5'] })
    expect(result.status).toBe(HttpStatus.OK)
    expect(result.body).toEqual([
      expect.objectContaining({ id: 'album-3', rank: 0 }),
      expect.objectContaining({ id: 'album-2', rank: 1 }),
      expect.objectContaining({ id: 'album-5', rank: 2 }),
      expect.objectContaining({ id: 'album-1', rank: 3 }),
      expect.objectContaining({ id: 'album-4', rank: 3 }),
    ])
  })

  test('DELETE /api/v1/gallery/albums/PNBwEli', async () => {
    const result = await request(app.getHttpServer()).delete('/api/v1/gallery/albums/PNBwEli').set('Cookie', prCookie)
    expect(result.status).toBe(HttpStatus.NO_CONTENT)
  })

  afterAll(() => {
    app.close()
  })
})
