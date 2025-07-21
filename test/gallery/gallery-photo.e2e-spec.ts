import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import expect from 'expect'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { Repository, In } from 'typeorm'

describe('Gallery photo', () => {
  let app: INestApplication
  let photoRepository: Repository<GalleryPhotoEntity>
  let prCookie: string[]

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
    prCookie = TestData.aValidSupertestCookies()
      .withAccessToken(await TestData.aValidAccessToken().withGroups('pr').build())
      .build()
  })

  beforeEach(async () => {
    photoRepository = await app.get(getRepositoryToken(GalleryPhotoEntity))
  })

  test('PATCH /api/v1/gallery/photos/move', async () => {
    const body = { albumId: 'newAlbum', ids: ['id1', 'id2'] }
    photoRepository.update = jest.fn().mockResolvedValue({ affected: 2 })
    const result = await request(app.getHttpServer())
      .patch('/api/v1/gallery/photos/move')
      .set('Cookie', prCookie)
      .send(body)

    expect(result.status).toBe(HttpStatus.NO_CONTENT)
    expect(photoRepository.update).toHaveBeenCalledWith({ id: In(body.ids) }, { albumId: body.albumId })
  })

  afterAll(() => {
    app.close()
  })
})
