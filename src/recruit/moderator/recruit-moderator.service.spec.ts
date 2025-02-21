import { ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { uuidv4 } from 'uuidv7'
import { RecruitModeratorService } from './recruit-moderator.service'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'

jest.mock('src/accounts/profile/profile-name.service')

describe(RecruitModeratorService.name, () => {
  let service: RecruitModeratorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitModeratorService,
        { provide: getRepositoryToken(RecruitApplicantEntity), useValue: {} },
        { provide: getRepositoryToken(RecruitRoleModeratorEntity), useValue: {} },
        ProfileNameService,
      ],
    }).compile()

    service = module.get(RecruitModeratorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RecruitModeratorService.prototype.hasPermissionToApplicantOrThrow.name, () => {
    const profileId = uuidv4()
    const applicantId = uuidv4()

    it('should return when no applicant id', async () => {
      await expect(service.hasPermissionToApplicantOrThrow(profileId)).resolves.toBeUndefined()
    })

    it('should throw when applicant is not found', async () => {
      service.getManageableRecruitId = jest.fn().mockResolvedValue([])
      service.getApplicantRecruitId = jest.fn().mockResolvedValue(null)
      await expect(service.hasPermissionToApplicantOrThrow(profileId, applicantId)).rejects.toThrow(ForbiddenException)
    })

    it('should throw when no manageable recruit id', async () => {
      service.getManageableRecruitId = jest.fn().mockResolvedValue([])
      service.getApplicantRecruitId = jest.fn().mockResolvedValue(uuidv4())
      await expect(service.hasPermissionToApplicantOrThrow(profileId, applicantId)).rejects.toThrow(ForbiddenException)
    })

    it('should throw when unmatch recruit id', async () => {
      service.getManageableRecruitId = jest.fn().mockResolvedValue([uuidv4()])
      service.getApplicantRecruitId = jest.fn().mockResolvedValue(uuidv4())
      await expect(service.hasPermissionToApplicantOrThrow(profileId, applicantId)).rejects.toThrow(ForbiddenException)
    })

    it('should return has match recruit id', async () => {
      const recruitId = uuidv4()
      service.getManageableRecruitId = jest.fn().mockResolvedValue([recruitId])
      service.getApplicantRecruitId = jest.fn().mockResolvedValue(recruitId)
      await expect(service.hasPermissionToApplicantOrThrow(profileId, applicantId)).resolves.toBeUndefined()
    })
  })
})
