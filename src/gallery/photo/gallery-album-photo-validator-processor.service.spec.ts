import { Test } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { Exif } from 'src/photo/models/exif.model'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { StorageService } from 'src/storage/storage.service'
import { GalleryAlbumPhotoValidatorProcessorService } from './gallery-album-photo-validator-processor.service'

jest.mock('src/photo/processor/photo-metadata.service')
jest.mock('src/storage/storage.service')

describe(GalleryAlbumPhotoValidatorProcessorService.name, () => {
  let service: GalleryAlbumPhotoValidatorProcessorService
  const dataSource = {
    transaction: jest.fn(),
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryAlbumPhotoValidatorProcessorService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(GalleryPhotoEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(GalleryAlbumEntity), useValue: jest.fn() },
        StorageService,
        PhotoMetadataService,
      ],
    }).compile()

    service = module.get(GalleryAlbumPhotoValidatorProcessorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryAlbumPhotoValidatorProcessorService.prototype.isValidResolution.name, () => {
    it('should return true when no requirement', () => {
      const result = service.isValidResolution(new Exif(3000, 4000), new GalleryAlbumEntity())
      expect(result).toBe(true)
    })

    it('should return true when met requirement', () => {
      const result = service.isValidResolution(
        new Exif(3000, 4000),
        new GalleryAlbumEntity({ minimumResolutionMp: 12 }),
      )
      expect(result).toBe(true)
    })

    it('should return false when small than expected', () => {
      const result = service.isValidResolution(
        new Exif(2999, 4000),
        new GalleryAlbumEntity({ minimumResolutionMp: 12 }),
      )
      expect(result).toBe(false)
    })
  })

  describe(GalleryAlbumPhotoValidatorProcessorService.prototype.isValidTimestamp.name, () => {
    it('should return true when no requirement', () => {
      const result = service.isValidTimestamp(new Date(), new GalleryAlbumEntity())
      expect(result).toBe(true)
    })

    describe('after', () => {
      const albumWithTakenAfter = new GalleryAlbumEntity({ takenAfter: new Date('2022-01-31T00:00:00Z') })

      it('should return true when photo taken 7AM BKK stored as UTC', () => {
        const takenDate = new Date('2022-01-31T00:00:00Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenAfter)
        expect(result).toBe(true)
      })

      it('should return false when photo taken BKK stored as UTC', () => {
        const takenDate = new Date('2022-01-30T23:59:59Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenAfter)
        expect(result).toBe(false)
      })
    })

    describe('before', () => {
      const albumWithTakenBefore = new GalleryAlbumEntity({ takenBefore: new Date('2022-01-31T00:00:00Z') })

      it('should return true when photo taken 7AM BKK stored as UTC', () => {
        const takenDate = new Date('2022-01-31T00:00:00Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenBefore)
        expect(result).toBe(true)
      })

      it('should return false when photo taken BKK stored as UTC', () => {
        const takenDate = new Date('2022-01-31T00:00:01Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenBefore)
        expect(result).toBe(false)
      })
    })

    describe('between', () => {
      const albumWithTakenAfterAndBefore = new GalleryAlbumEntity({
        takenAfter: new Date('2022-01-15T00:00:00Z'),
        takenBefore: new Date('2022-01-16T00:00:00Z'),
      })

      it('should return true when between time range', () => {
        const takenDate = new Date('2022-01-15T12:00:00Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenAfterAndBefore)
        expect(result).toBe(true)
      })

      it('should return false when taken prior after', () => {
        const takenDate = new Date('2022-01-12T00:00:00Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenAfterAndBefore)
        expect(result).toBe(false)
      })

      it('should return false when taken later before', () => {
        const takenDate = new Date('2022-01-17T00:00:00Z')
        const result = service.isValidTimestamp(takenDate, albumWithTakenAfterAndBefore)
        expect(result).toBe(false)
      })
    })
  })
})
