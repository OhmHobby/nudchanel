import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { WinstonConfig } from 'src/configs/winston.config'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'
import { uuidv4 } from 'uuidv7'

describe('Gallery photo', () => {
  let app: INestApplication
  let galleryPhotoRepository: Repository<GalleryPhotoEntity>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
        TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
        TypeOrmModule.forFeature([GalleryPhotoEntity]),
      ],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()
    galleryPhotoRepository = app.get(getRepositoryToken(GalleryPhotoEntity))
  })

  it('should be defined', () => {
    expect(galleryPhotoRepository).toBeDefined()
  })

  describe('find by state', () => {
    const albumId = 'dfb7HiX'
    const photos = [
      TestData.aValidGalleryPhoto().withId().withAlbumId(albumId).build(),
      TestData.aValidGalleryPhoto().withId().withAlbumId(albumId).withValidatedAt(new Date()).build(),
      TestData.aValidGalleryPhoto()
        .withId()
        .withAlbumId(albumId)
        .withValidatedAt(new Date())
        .withProcessedAt(new Date())
        .build(),
      TestData.aValidGalleryPhoto()
        .withId()
        .withAlbumId(albumId)
        .withValidatedAt(new Date())
        .withProcessedAt(new Date())
        .withReviewedBy(uuidv4())
        .build(),
      TestData.aValidGalleryPhoto()
        .withId()
        .withAlbumId(albumId)
        .withValidatedAt(new Date())
        .withRejectReason(GalleryPhotoRejectReason.other)
        .build(),
      TestData.aValidGalleryPhoto()
        .withId()
        .withAlbumId(albumId)
        .withValidatedAt(new Date())
        .withErrorMessage('Error')
        .build(),
    ]

    beforeEach(async () => {
      await galleryPhotoRepository.delete({ albumId })
      await galleryPhotoRepository.insert(photos)
    })

    test('undefined', async () => {
      const result = await galleryPhotoRepository.findBy({ albumId, ...GalleryPhotoEntity.findByStateOptionsWhere() })
      expect(result).toHaveLength(photos.length)
    })

    test.each([
      GalleryPhotoState.created,
      GalleryPhotoState.accepted,
      GalleryPhotoState.processed,
      GalleryPhotoState.approved,
      GalleryPhotoState.rejected,
      GalleryPhotoState.failed,
    ])('%s', async (state: GalleryPhotoState) => {
      const result = await galleryPhotoRepository.findBy({
        albumId,
        ...GalleryPhotoEntity.findByStateOptionsWhere(state),
      })
      expect(result.map((el) => el.state)).toEqual([state])
    })
  })

  afterAll(() => {
    return app.close()
  })
})
