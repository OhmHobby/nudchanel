import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitFormService } from '../form/recruit-form.service'
import dayjs from 'dayjs'

jest.mock('src/accounts/profile/profile-name.service')
jest.mock('../form/recruit-form.service')

describe(RecruitApplicantService.name, () => {
  let service: RecruitApplicantService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitApplicantService,
        { provide: getRepositoryToken(RecruitApplicantEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(RecruitApplicantRoleEntity), useValue: jest.fn() },
        ProfileNameService,
        RecruitFormService,
      ],
    }).compile()

    service = module.get<RecruitApplicantService>(RecruitApplicantService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RecruitApplicantService.prototype.findOne.name, () => {
    beforeEach(() => {
      service.find = jest.fn().mockResolvedValue([new RecruitApplicantEntity()])
    })

    it('should find given applicantId', async () => {
      const result = await service.findOne('applicant-id')
      expect(service.find).toHaveBeenCalled()
      expect(result).toBeInstanceOf(RecruitApplicantEntity)
    })

    it('should find given profileId and settingId', async () => {
      const result = await service.findOne(undefined, 'setting-id', 'profile-id')
      expect(service.find).toHaveBeenCalled()
      expect(result).toBeInstanceOf(RecruitApplicantEntity)
    })

    it('should return null only settingId', async () => {
      const result = await service.findOne(undefined, 'setting-id', undefined)
      expect(service.find).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null only profileId', async () => {
      const result = await service.findOne(undefined, undefined, 'profile-id')
      expect(service.find).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null when applicant is not found', async () => {
      service.find = jest.fn().mockResolvedValue([])
      const result = await service.findOne('applicant-id')
      expect(service.find).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe(RecruitApplicantService.prototype.checkApplicantOfferOrThrow.name, () => {
    it('should throw error if offerExpireAt is in the past', () => {
      const pastDate = new Date(Date.now() - 1000)
      expect(() => service.checkApplicantOfferOrThrow(pastDate)).toThrow('Offer expired')
    })

    it('should return current date if offerExpireAt is in the period', () => {
      const futureDate = dayjs().add(1, 'day').toDate()
      const now = new Date()
      const result = service.checkApplicantOfferOrThrow(futureDate, now)
      expect(result).toBeInstanceOf(Date)
      expect(+result).toEqual(+now)
    })

    it("should throw error if offerExpireAt is null (don't have offer)", () => {
      expect(() => service.checkApplicantOfferOrThrow(null)).toThrow('Offer not available')
    })
  })
  describe(RecruitApplicantService.prototype.checkApplicantReadyToAcceptOfferOrThrow.name, () => {
    it('should throw error if applicant has accepted an offer', async () => {
      service.isApplicantAcceptAnyOffer = jest.fn().mockResolvedValue(true)
      await expect(service.checkApplicantReadyToAcceptOfferOrThrow('applicant-id')).rejects.toThrow(
        'Applicant already accepted an offer',
      )
    })

    it('should not throw error if applicant has not accepted any offer', async () => {
      service.isApplicantAcceptAnyOffer = jest.fn().mockResolvedValue(false)
      await expect(service.checkApplicantReadyToAcceptOfferOrThrow('applicant-id')).resolves.not.toThrow()
    })
  })
})
