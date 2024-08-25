import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryActivityService } from './gallery-activity.service'

describe(GalleryActivityService.name, () => {
  let service: GalleryActivityService
  const activityModel = getModelForClass(GalleryActivityModel)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryActivityService,
        { provide: getModelToken(GalleryActivityModel.name), useValue: activityModel },
      ],
    }).compile()

    service = module.get(GalleryActivityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryActivityService.prototype.findActivities.name, () => {
    let mockModel

    beforeEach(() => {
      mockModel = {
        sort: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }
      activityModel.find = jest.fn().mockReturnValue(mockModel)
    })

    it('should build default correctly', async () => {
      await service.findActivities(10)
      expect(mockModel.sort).toHaveBeenCalled()
      expect(mockModel.where).toHaveBeenCalledWith(expect.objectContaining({ published: true }))
      expect(mockModel.limit).toHaveBeenCalledWith(10)
    })

    it('should build with before correctly', async () => {
      const before = new Date(2023, 4, 24)
      await service.findActivities(10, before)
      expect(mockModel.sort).toHaveBeenCalled()
      expect(mockModel.where).toHaveBeenCalledWith({ time: { $lt: before } })
    })

    it('should build with year correctly', async () => {
      await service.findActivities(10, undefined, 2024)
      expect(mockModel.sort).toHaveBeenCalled()
      expect(mockModel.where).toHaveBeenCalledWith({
        time: { $lt: service.academicYearStartDate(2025), $gt: service.academicYearStartDate(2024) },
      })
    })

    it('should build with year and before correctly', async () => {
      const before = new Date(2023, 9, 28)
      await service.findActivities(10, before, 2024)
      expect(mockModel.sort).toHaveBeenCalled()
      expect(mockModel.where).toHaveBeenCalledWith({
        time: { $lt: before, $gt: service.academicYearStartDate(2024) },
      })
    })

    it('should build with includes unpublished correctly', async () => {
      await service.findActivities(10, undefined, undefined, undefined, true)
      expect(mockModel.sort).toHaveBeenCalled()
      expect(mockModel.where).not.toHaveBeenCalledWith(expect.objectContaining({ published: true }))
      expect(mockModel.limit).toHaveBeenCalledWith(10)
    })
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
