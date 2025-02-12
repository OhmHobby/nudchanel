import { ConflictException, ForbiddenException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { TestData } from 'test/test-data'
import { GalleryPhotoService } from './gallery-photo.service'

describe(GalleryPhotoService.name, () => {
  let service: GalleryPhotoService
  const photoRepository = { findOne: jest.fn() }
  const reviewerProfile = ProfileIdModel.fromObjectId(TestData.aValidProfile().build()._id)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GalleryPhotoService, { provide: getRepositoryToken(GalleryPhotoEntity), useValue: photoRepository }],
    }).compile()

    service = module.get(GalleryPhotoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryPhotoService.prototype.approvalPrecheck, () => {
    describe('failure', () => {
      test('not found', async () => {
        const photo = TestData.aValidGalleryPhoto().withId().build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ConflictException)
      })

      test('non validated', async () => {
        const photo = TestData.aValidGalleryPhoto().withId().build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ConflictException)
      })

      test('has error', async () => {
        const photo = TestData.aValidGalleryPhoto()
          .withId()

          .withValidatedAt(new Date())
          .withErrorMessage('Unknown')
          .build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ConflictException)
      })

      test('already reviewed', async () => {
        const photo = TestData.aValidGalleryPhoto()
          .withId()

          .withValidatedAt(new Date())
          .withReviewedBy(reviewerProfile.uuid)
          .build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ConflictException)
      })

      test('system rejection', async () => {
        const photo = TestData.aValidGalleryPhoto()
          .withId()

          .withValidatedAt(new Date())
          .withRejectReason(GalleryPhotoRejectReason.timestamp)
          .build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ConflictException)
      })

      test('same author', async () => {
        const photo = TestData.aValidGalleryPhoto()
          .withId()

          .withValidatedAt(new Date())
          .withTakenBy(reviewerProfile.uuid)
          .build()
        photoRepository.findOne = jest.fn().mockResolvedValue(photo)
        await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).rejects.toThrow(ForbiddenException)
      })
    })

    test('passed', async () => {
      const photo = TestData.aValidGalleryPhoto().withId().withValidatedAt(new Date()).build()
      photoRepository.findOne = jest.fn().mockResolvedValue(photo)
      await expect(service.approvalPrecheck(photo.id, reviewerProfile.uuid)).resolves.toBeUndefined()
    })
  })
})
