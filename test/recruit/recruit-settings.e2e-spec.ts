import { HttpStatus, INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { mockQueryBuilder } from 'test/helpers/mock-query-builder'
import { TestData } from 'test/test-data'
import { Repository } from 'typeorm'
import request from 'supertest'

describe('Recruit Settings', () => {
  let app: INestApplication
  let mockRecruitSettingRepository: Repository<RecruitSettingEntity>
  let mockRecruitApplicantRepository: Repository<RecruitApplicantEntity>
  let mockRecruitRoleModeratorRepository: Repository<RecruitRoleModeratorEntity>

  beforeAll(async () => {
    app = await TestData.aValidApp().build()
  })

  beforeEach(async () => {
    mockRecruitSettingRepository = await app.get(getRepositoryToken(RecruitSettingEntity))
    mockRecruitApplicantRepository = await app.get(getRepositoryToken(RecruitApplicantEntity))
    mockRecruitRoleModeratorRepository = await app.get(getRepositoryToken(RecruitRoleModeratorEntity))
  })

  describe('POST /api/v1/recruit/settings', () => {
    it('should create a new recruit setting', async () => {
      const createDto = {
        year: 2025,
        name: 'Test Recruit 2025',
        openWhen: dayjs().add(1, 'day').toDate(),
        closeWhen: dayjs().add(30, 'days').toDate(),
        announceWhen: dayjs().add(35, 'days').toDate(),
        maximumRole: 2,
        isActive: false,
      }

      const mockSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      const createdSetting = { ...mockSetting, ...createDto }

      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(mockSetting)
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      mockRecruitSettingRepository.save = jest.fn().mockResolvedValue(createdSetting)
      mockRecruitSettingRepository.update = jest.fn().mockResolvedValue({ affected: 0 })

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const result = await request(app.getHttpServer())
        .post('/api/v1/recruit/settings')
        .set('Cookie', cookie)
        .send(createDto)

      expect(result.status).toBe(HttpStatus.CREATED)
      expect(result.body).toMatchObject({
        id: mockSetting.id,
        year: createDto.year,
        name: createDto.name,
        maximumRole: createDto.maximumRole,
        isActive: createDto.isActive,
      })
    })

    it('should create an active setting and deactivate others', async () => {
      const mockSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(mockSetting)
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      mockRecruitSettingRepository.save = jest.fn().mockResolvedValue(mockSetting)
      mockRecruitSettingRepository.update = jest.fn().mockResolvedValue({ affected: 1 })

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const createDto = {
        year: 2025,
        name: 'Test Recruit 2025',
        openWhen: dayjs().add(1, 'day').toDate(),
        closeWhen: dayjs().add(30, 'days').toDate(),
        announceWhen: dayjs().add(35, 'days').toDate(),
        maximumRole: 2,
        isActive: true,
      }

      const result = await request(app.getHttpServer())
        .post('/api/v1/recruit/settings')
        .set('Cookie', cookie)
        .send(createDto)

      expect(result.status).toBe(HttpStatus.CREATED)
      expect(mockRecruitSettingRepository.update).toHaveBeenCalledWith({ isActive: true }, { isActive: false })
    })

    it('should validate date order', async () => {
      const mockSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(mockSetting)
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const createDto = {
        year: 2025,
        name: 'Test Recruit 2025',
        openWhen: dayjs().add(30, 'days').toDate(),
        closeWhen: dayjs().add(1, 'day').toDate(),
        announceWhen: dayjs().add(35, 'days').toDate(),
        maximumRole: 2,
        isActive: false,
      }

      const result = await request(app.getHttpServer())
        .post('/api/v1/recruit/settings')
        .set('Cookie', cookie)
        .send(createDto)

      expect(result.status).toBe(HttpStatus.BAD_REQUEST)
    })
  })

  describe('PUT /api/v1/recruit/settings/:id', () => {
    it('should update an existing recruit setting', async () => {
      const existingSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      const updatedSetting = { ...existingSetting, name: 'Updated Name', maximumRole: 3 }

      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(existingSetting)
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: existingSetting.id }]),
        }),
      )

      mockRecruitSettingRepository.save = jest.fn().mockResolvedValue(updatedSetting)
      mockRecruitSettingRepository.update = jest.fn().mockResolvedValue({ affected: 0 })

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const updateDto = {
        name: 'Updated Name',
        maximumRole: 3,
      }

      const result = await request(app.getHttpServer())
        .put('/api/v1/recruit/settings/01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .set('Cookie', cookie)
        .send(updateDto)

      expect(result.status).toBe(HttpStatus.OK)
      expect(result.body).toMatchObject({
        id: existingSetting.id,
        name: updateDto.name,
        maximumRole: updateDto.maximumRole,
      })
    })

    it('should activate a setting and deactivate others', async () => {
      const existingSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      const updatedSetting = { ...existingSetting, isActive: true }

      mockRecruitSettingRepository.findOne = jest.fn().mockResolvedValue(existingSetting)
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: existingSetting.id }]),
        }),
      )

      mockRecruitSettingRepository.save = jest.fn().mockResolvedValue(updatedSetting)
      mockRecruitSettingRepository.update = jest.fn().mockResolvedValue({ affected: 1 })

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const updateDto = {
        isActive: true,
      }

      const result = await request(app.getHttpServer())
        .put('/api/v1/recruit/settings/01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .set('Cookie', cookie)
        .send(updateDto)

      expect(result.status).toBe(HttpStatus.OK)
      expect(mockRecruitSettingRepository.update).toHaveBeenCalledWith({ isActive: true }, { isActive: false })
    })

    it('should return 404 for non-existent setting', async () => {
      const mockSetting = TestData.aValidRecruitSetting()
        .withId('01976d72-ccc5-7aac-aca6-6c6d5cb606ad')
        .withOpen(true)
        .withClose(false)
        .withAnnounce(false)
        .build()

      mockRecruitSettingRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockSetting) // For middleware
        .mockResolvedValueOnce(null) // For service
      mockRecruitApplicantRepository.find = jest.fn().mockResolvedValue([])
      mockRecruitRoleModeratorRepository.createQueryBuilder = jest.fn().mockReturnValue(
        mockQueryBuilder({
          getRawMany: jest.fn().mockResolvedValue([{ recruitId: mockSetting.id }]),
        }),
      )

      const cookie = TestData.aValidSupertestCookies()
        .withAccessToken(await TestData.aValidAccessToken().withGroups('nudch').build())
        .build()

      const updateDto = {
        name: 'Updated Name',
      }

      const result = await request(app.getHttpServer())
        .put('/api/v1/recruit/settings/00000000-0000-0000-0000-000000000000')
        .set('Cookie', cookie)
        .send(updateDto)

      expect(result.status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
