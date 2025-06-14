import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { mockQueryBuilder } from 'test/helpers/mock-query-builder'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'
import request from 'supertest'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'

describe('Recruit Applicant Role', () => {
  let app: INestApplication
  let mockRecruitApplicantRoleRepository: Repository<RecruitApplicantRoleEntity>
  let mockRecruitApplicant: Repository<RecruitApplicantEntity>
  let mockRecruitSettingRepository: Repository<RecruitSettingEntity>
  let mockRecruitRoleModeratorRepository: Repository<RecruitRoleModeratorEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockRecruitApplicantRoleRepository = await app.get(getRepositoryToken(RecruitApplicantRoleEntity))
    mockRecruitSettingRepository = await app.get(getRepositoryToken(RecruitSettingEntity))
    mockRecruitRoleModeratorRepository = await app.get(getRepositoryToken(RecruitRoleModeratorEntity))
    mockRecruitApplicant = await app.get(getRepositoryToken(RecruitApplicantEntity))
  })

  describe('PATCH /api/v1/recruit/applicants/01976d89-0982-7aac-aca6-77ee02d11382/offer', () => {
    const mockSetting = TestData.aValidRecruitSetting().withOpen(true).withClose(true).withAnnounce(false).build()

    const mockRole = TestData.aValidRecruitRole().withId('01976dc9-c80b-7aac-aca6-883671a236a1').build()

    const mockApplicant = TestData.aValidRecruitApplicant()
      .withId('01976d89-0982-7aac-aca6-77ee02d11382')
      .withRecruitId(mockSetting.id)
      .build()

    it('offer', async () => {
      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(mockSetting)
      const mockApplicantRole = TestData.aValidRecruitApplicantRole()
        .withId('01976dc8-8df9-7aac-aca6-813cc77e56d4')
        .withApplicantId(mockApplicant.id)
        .withRoleId(mockRole.id)
        .withOffer(null)
        .withAccepted(false)
        .withResponseAt(null)
        .build()

      mockRecruitApplicant.findOne = jest.fn().mockResolvedValue(mockApplicant)
      mockRecruitApplicant.find = jest.fn().mockResolvedValue([mockApplicant])
      mockRecruitApplicantRoleRepository.findOne = jest.fn().mockResolvedValue(mockApplicantRole)
      mockRecruitApplicantRoleRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
      mockRecruitApplicantRoleRepository.countBy = jest.fn().mockResolvedValue(0)
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch', 'head').build())
        .build()

      const expireAt = dayjs().add(1, 'day').toDate()
      const result = await request(app.getHttpServer())
        .patch('/api/v1/recruit/applicants/01976d89-0982-7aac-aca6-77ee02d11382/offer')
        .set('Cookie', cookie)
        .send({ roleId: mockRole.id, offerExpireAt: expireAt })

      expect(result.status).toBe(HttpStatus.NO_CONTENT)
      expect(mockRecruitApplicantRoleRepository.update).toHaveBeenCalledWith(mockApplicantRole.id, {
        offerExpireAt: expireAt,
        offerResponseAt: null,
        offerAccepted: false,
      })
    })

    it('reset offer', async () => {
      const expireAt = dayjs().add(1, 'day').toDate()
      const mockApplicantRole = TestData.aValidRecruitApplicantRole()
        .withId('01976dc8-8df9-7aac-aca6-813cc77e56d4')
        .withApplicantId(mockApplicant.id)
        .withRoleId(mockRole.id)
        .withOffer(expireAt)
        .withAccepted(false)
        .withResponseAt(null)
        .build()

      mockRecruitApplicant.findOne = jest.fn().mockResolvedValue(mockApplicant)
      mockRecruitApplicant.find = jest.fn().mockResolvedValue([mockApplicant])
      mockRecruitApplicantRoleRepository.findOne = jest.fn().mockResolvedValue(mockApplicantRole)
      mockRecruitApplicantRoleRepository.update = jest.fn().mockResolvedValue({ affected: 1 })
      mockRecruitApplicantRoleRepository.countBy = jest.fn().mockResolvedValue(0)
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch', 'head').build())
        .build()

      const result = await request(app.getHttpServer())
        .patch('/api/v1/recruit/applicants/01976d89-0982-7aac-aca6-77ee02d11382/offer')
        .set('Cookie', cookie)
        .send({ roleId: mockRole.id, expireAt: null })

      expect(result.status).toBe(HttpStatus.NO_CONTENT)
      expect(mockRecruitApplicantRoleRepository.update).toHaveBeenCalledWith(mockApplicantRole.id, {
        offerExpireAt: null,
        offerResponseAt: null,
        offerAccepted: false,
      })
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
