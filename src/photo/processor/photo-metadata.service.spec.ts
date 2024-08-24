const mockExifParser = jest.fn()

jest.mock('exif-parser', () => ({
  create() {
    return this
  },
  parse: mockExifParser,
}))

import { Test, TestingModule } from '@nestjs/testing'
import { PhotoMetadataService } from './photo-metadata.service'
import { PhotoProcessorService } from './photo-processor.service'

jest.mock('./photo-processor.service')

describe(PhotoMetadataService.name, () => {
  let service: PhotoMetadataService
  const mockBuffer = Buffer.from('')

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoMetadataService, PhotoProcessorService],
    }).compile()

    service = module.get(PhotoMetadataService)
  })

  describe(PhotoMetadataService.prototype.getFileExif.name, () => {
    it('should return date when no exif date data', () => {
      mockExifParser.mockReset().mockReturnValue({ imageSize: { width: 0, height: 0 }, tags: {} })
      const result = service.getFileExif(mockBuffer)
      expect(result.date).toEqual(new Date(0))
    })

    it('should return date correctly', () => {
      mockExifParser.mockReset().mockReturnValue({
        imageSize: { width: 0, height: 0 },
        tags: { DateTimeOriginal: '125200' },
      })
      const result = service.getFileExif(mockBuffer)
      expect(result.date).toEqual(new Date(100000000))
    })

    it('should return date that come first', () => {
      mockExifParser.mockReset().mockReturnValue({
        imageSize: { width: 0, height: 0 },
        tags: { DateTimeOriginal: '125200', CreateDate: '225200' },
      })
      const result = service.getFileExif(mockBuffer)
      expect(result.date).toEqual(new Date(100000000))
    })

    it('should return CreateDate when DateTimeOriginal is String', () => {
      mockExifParser.mockReset().mockReturnValue({
        imageSize: { width: 0, height: 0 },
        tags: {
          DateTimeOriginal: '2023-06-01 07:00:00',
          CreateDate: '1685581200',
        },
      })
      const result = service.getFileExif(mockBuffer)
      expect(result.date).toEqual(new Date(1685556000000))
    })
  })
})
