import { HttpStatus, INestApplication } from '@nestjs/common'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryAlbumResponseModel } from 'src/gallery/dto/gallery-album-response.model'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { DataSource, Repository } from 'typeorm'

describe('Gallery album', () => {
  let app: INestApplication
  let dataSource: DataSource
  let mockGalleryAlbumRepository: Repository<GalleryAlbumEntity>
  let prCookie: string[]

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
    prCookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
  })

  beforeEach(async () => {
    dataSource = await app.get(getDataSourceToken())
    mockGalleryAlbumRepository = await app.get(getRepositoryToken(GalleryAlbumEntity))
  })

  test('GET /api/v1/gallery/albums', async () => {
    const album = TestData.aValidGalleryAlbum().build()
    mockGalleryAlbumRepository.find = jest.fn().mockResolvedValue([album])
    const result = await request(app.getHttpServer()).get('/api/v1/gallery/albums?activityId=AINfyH5').send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryAlbumResponseModel[] = result.body

    expect(body?.at(0)?.id).toBe(album.id)
    expect(body?.at(0)?.cover).toBe(album.cover)
    expect(body?.at(0)?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${album.cover}.jpg`)
    expect(body?.at(0)?.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${album.cover}.webp`)
    expect(body?.at(0)?.activity).toBeUndefined()
  })

  test('GET /api/v1/gallery/albums/:id', async () => {
    const activity = TestData.aValidGalleryActivity().build()
    const album = TestData.aValidGalleryAlbum().withActivity(activity).build()
    mockGalleryAlbumRepository.findOne = jest.fn().mockResolvedValue(album)

    const result = await request(app.getHttpServer())
      .get('/api/v1/gallery/albums/' + album.id)
      .send()

    expect(result.status).toBe(HttpStatus.OK)
    const body: GalleryAlbumResponseModel = result.body

    expect(body?.id).toBe(album.id)
    expect(body?.title).toBe(album.title)
    expect(body?.cover).toBe(album.cover)
    expect(body?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${album.cover}.jpg`)
    expect(body?.cardUrl).toBe(`https://photos.nudchannel.com/photos/card/${album.cover}.webp`)
    expect(body?.activity?.id).toBe(activity.id)
    expect(body?.activity?.title).toBe(activity.title)
    expect(body?.activity?.coverUrl).toBe(`https://photos.nudchannel.com/photos/cover/${activity.cover}.jpg`)
  })

  test('PUT /api/v1/gallery/albums/rank', async () => {
    dataSource.transaction = jest.fn().mockImplementation((cb) => Promise.resolve(cb({ save: jest.fn() })))
    mockGalleryAlbumRepository.find = jest
      .fn()
      .mockResolvedValue([
        TestData.aValidGalleryAlbum().withId('album-1').build(),
        TestData.aValidGalleryAlbum().withId('album-2').build(),
        TestData.aValidGalleryAlbum().withId('album-3').build(),
        TestData.aValidGalleryAlbum().withId('album-4').build(),
        TestData.aValidGalleryAlbum().withId('album-5').build(),
      ])
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
    mockGalleryAlbumRepository.softDelete = jest.fn().mockResolvedValue({ affected: 1 })
    const result = await request(app.getHttpServer()).delete('/api/v1/gallery/albums/PNBwEli').set('Cookie', prCookie)
    expect(result.status).toBe(HttpStatus.NO_CONTENT)
  })

  afterAll(() => {
    app.close()
  })
})
