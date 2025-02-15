import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { WinstonConfig } from 'src/configs/winston.config'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { GalleryPhotoService } from 'src/gallery/photo/gallery-photo.service'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'

describe('Gallery photo service', () => {
  let app: INestApplication
  let service: GalleryPhotoService
  let photoRepository: Repository<GalleryPhotoEntity>
  const reviewerProfile = ProfileIdModel.fromObjectId(TestData.aValidProfile().build()._id)

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
        TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
        TypeOrmModule.forFeature([GalleryPhotoEntity]),
      ],
      providers: [GalleryPhotoService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()
    service = app.get(GalleryPhotoService)
    photoRepository = app.get(getRepositoryToken(GalleryPhotoEntity))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(photoRepository).toBeDefined()
  })

  test(GalleryPhotoService.prototype.approvePhoto.name, async () => {
    const photo = TestData.aValidGalleryPhoto().withId().withValidatedAt(new Date()).build()
    await photoRepository.insert([photo])
    expect(photo.state).toBe(GalleryPhotoState.accepted)
    await expect(service.approvePhoto(photo.id, reviewerProfile)).resolves.toBeUndefined()
    const result = await photoRepository.findOneBy({ id: photo.id })
    expect(result?.state).toBe(GalleryPhotoState.approved)
  })

  test(GalleryPhotoService.prototype.rejectPhoto.name, async () => {
    const photo = TestData.aValidGalleryPhoto().withId().withValidatedAt(new Date()).build()
    await photoRepository.insert([photo])
    expect(photo.state).toBe(GalleryPhotoState.accepted)
    await expect(
      service.rejectPhoto(photo.id, reviewerProfile, GalleryPhotoRejectReason.other),
    ).resolves.toBeUndefined()
    const result = await photoRepository.findOneBy({ id: photo.id })
    expect(result?.state).toBe(GalleryPhotoState.rejected)
  })

  describe(GalleryPhotoService.prototype.resetApprovals.name, () => {
    test('system rejection', async () => {
      const photo = TestData.aValidGalleryPhoto()
        .withId()
        .withValidatedAt(new Date())
        .withRejectReason(GalleryPhotoRejectReason.timestamp)
        .build()
      await photoRepository.insert([photo])
      expect(photo.state).toBe(GalleryPhotoState.rejected)
      await expect(service.resetApprovals(photo.id)).resolves.toBeUndefined()
      const result = await photoRepository.findOneBy({ id: photo.id })
      expect(result?.state).toBe(GalleryPhotoState.accepted)
    })

    test('user rejection', async () => {
      const photo = TestData.aValidGalleryPhoto()
        .withId()
        .withValidatedAt(new Date())
        .withRejectReason(GalleryPhotoRejectReason.other)
        .withReviewedBy(reviewerProfile.uuid)
        .build()
      await photoRepository.insert([photo])
      expect(photo.state).toBe(GalleryPhotoState.rejected)
      await expect(service.resetApprovals(photo.id)).resolves.toBeUndefined()
      const result = await photoRepository.findOneBy({ id: photo.id })
      expect(result?.state).toBe(GalleryPhotoState.accepted)
    })
  })

  afterAll(() => {
    return app.close()
  })
})
