import { Test } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryActivityService } from './gallery-activity.service'

describe(GalleryActivityService.name, () => {
  let service: GalleryActivityService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryActivityService,
        { provide: getDataSourceToken(), useValue: jest.fn() },
        { provide: getRepositoryToken(GalleryActivityEntity), useValue: jest.fn() },
      ],
    }).compile()

    service = module.get(GalleryActivityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryActivityService.prototype.selectEailerDate.name, () => {
    it('should return date A when date A less than date B', () => {
      const a = new Date(100000)
      const b = new Date(200000)
      expect(service.selectEailerDate(a, b)).toBe(a)
    })

    it('should return date B when date B less than date A', () => {
      const a = new Date(200000)
      const b = new Date(100000)
      expect(service.selectEailerDate(a, b)).toBe(b)
    })

    it('should return date A when date B is undefined', () => {
      const a = new Date(100000)
      expect(service.selectEailerDate(a)).toBe(a)
    })

    it('should return date B when date A is undefined', () => {
      const b = new Date(100000)
      expect(service.selectEailerDate(undefined, b)).toBe(b)
    })

    it('should return undefined when date A and date B are undefined', () => {
      expect(service.selectEailerDate(undefined, undefined)).toBe(undefined)
    })
  })

  describe(GalleryActivityService.prototype.academicYearStartDate.name, () => {
    it('should return Date', () => {
      const year = 2020
      const result = service.academicYearStartDate(year)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(year)
    })

    it('should return undefined', () => {
      const result = service.academicYearStartDate()
      expect(result?.getFullYear()).toBe(undefined)
    })
  })

  describe(GalleryActivityService.prototype.academicYearEndDate.name, () => {
    it('should return start date of next year', () => {
      const year = 2020
      service.academicYearStartDate = jest.fn().mockReturnValue(new Date())
      const result = service.academicYearEndDate(year)
      expect(service.academicYearStartDate).toHaveBeenCalledWith(2021)
      expect(result).toBeInstanceOf(Date)
    })

    it('should return undefined', () => {
      const result = service.academicYearEndDate()
      expect(result).toBeUndefined()
    })
  })
})
