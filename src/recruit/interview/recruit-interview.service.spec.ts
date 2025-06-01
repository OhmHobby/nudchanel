import { Test, TestingModule } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitRoleService } from '../role/recruit-role.service'
import { RecruitInterviewService } from './recruit-interview.service'

jest.mock('../applicant/recruit-applicant.service')
jest.mock('../role/recruit-role.service')

describe(RecruitInterviewService.name, () => {
  let service: RecruitInterviewService
  let applicantService: RecruitApplicantService
  let roleService: RecruitRoleService
  const dataSource = {
    transaction: jest.fn(),
  }
  const interviewSlotRepostory = {
    find: jest.fn(),
  }
  const slots = [
    new RecruitInterviewSlotEntity({
      id: '1',
      startWhen: new Date('2024-07-29T15:00:00.000Z'),
      endWhen: new Date('2024-07-29T15:30:00.000Z'),
      roleId: '1',
      applicantId: 'applicant-1',
    }),
    new RecruitInterviewSlotEntity({
      id: '2',
      startWhen: new Date('2024-07-29T15:00:00.000Z'),
      endWhen: new Date('2024-07-29T15:30:00.000Z'),
      roleId: '2',
      applicantId: 'applicant-1',
    }),
    new RecruitInterviewSlotEntity({
      id: '3',
      startWhen: new Date('2024-07-29T15:00:00.000Z'),
      endWhen: new Date('2024-07-29T15:30:00.000Z'),
      roleId: '3',
      applicantId: 'applicant-1',
    }),
    new RecruitInterviewSlotEntity({
      id: '4',
      startWhen: new Date('2024-07-29T15:00:00.000Z'),
      endWhen: new Date('2024-07-29T15:30:00.000Z'),
      roleId: '1',
      applicantId: null,
    }),
    new RecruitInterviewSlotEntity({
      id: '5',
      startWhen: new Date('2024-07-29T15:00:00.000Z'),
      endWhen: new Date('2024-07-29T15:30:00.000Z'),
      roleId: '2',
      applicantId: null,
    }),
    new RecruitInterviewSlotEntity({
      id: '9',
      startWhen: new Date('2024-07-29T16:00:00.000Z'),
      endWhen: new Date('2024-07-29T16:30:00.000Z'),
      roleId: '9',
      applicantId: 'applicant-9',
      interviewAt: new Date('2024-07-30T16:30:00.000Z'),
    }),
  ]
  const applicants = [
    new RecruitApplicantModel({
      id: 'applicant-1',
    }),
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitInterviewService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(RecruitInterviewSlotEntity), useValue: interviewSlotRepostory },
        RecruitApplicantService,
        RecruitRoleService,
      ],
    }).compile()

    service = module.get<RecruitInterviewService>(RecruitInterviewService)
    applicantService = module.get(RecruitApplicantService)
    roleService = module.get(RecruitRoleService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RecruitInterviewService.prototype.getSlots.name, () => {
    beforeEach(() => {
      service.isSelectedSlot = jest.fn()
      service.isSlotAvailable = jest.fn()
      roleService.getMandatoryInterviewRoleIds = jest.fn().mockResolvedValue(['1'])
      applicantService.getRecruitApplicantModels = jest.fn().mockResolvedValue(applicants)
    })

    it('should group the slot correctly', async () => {
      interviewSlotRepostory.find.mockResolvedValue(slots)
      const result = await service.getSlots('')
      expect(roleService.getMandatoryInterviewRoleIds).not.toHaveBeenCalled()
      expect(service.isSelectedSlot).not.toHaveBeenCalled()
      expect(applicantService.getRecruitApplicantModels).not.toHaveBeenCalled()
      expect(result).toEqual([
        {
          start: new Date('2024-07-29T15:00:00.000Z'),
          end: new Date('2024-07-29T15:30:00.000Z'),
          roles: undefined,
          interviewedAt: undefined,
          isAvailable: undefined,
          isSelected: undefined,
          applicants: undefined,
        },
        {
          start: new Date('2024-07-29T16:00:00.000Z'),
          end: new Date('2024-07-29T16:30:00.000Z'),
          roles: undefined,
          interviewedAt: undefined,
          isAvailable: undefined,
          isSelected: undefined,
          applicants: undefined,
        },
      ])
    })

    it('should return detail (roles and occupied applicants) when request', async () => {
      interviewSlotRepostory.find.mockResolvedValue(
        slots.map((el) => ({ ...el, role: new RecruitRoleEntity({ id: el.roleId! }) })),
      )
      const result = await service.getSlots('', undefined, true)
      expect(roleService.getMandatoryInterviewRoleIds).not.toHaveBeenCalled()
      expect(service.isSelectedSlot).not.toHaveBeenCalled()
      expect(applicantService.getRecruitApplicantModels).toHaveBeenCalled()
      expect(result).toEqual([
        {
          start: new Date('2024-07-29T15:00:00.000Z'),
          end: new Date('2024-07-29T15:30:00.000Z'),
          roles: expect.arrayContaining([expect.objectContaining({ id: '1' })]),
          interviewedAt: undefined,
          isAvailable: undefined,
          isSelected: undefined,
          applicants: [applicants[0]],
        },
        {
          start: new Date('2024-07-29T16:00:00.000Z'),
          end: new Date('2024-07-29T16:30:00.000Z'),
          roles: [expect.objectContaining({ id: '9' })],
          interviewedAt: new Date('2024-07-30T16:30:00.000Z'),
          isAvailable: undefined,
          isSelected: undefined,
          applicants: [],
        },
      ])
    })

    it('should return applicant data when applicant id exist', async () => {
      interviewSlotRepostory.find.mockResolvedValue(slots)
      service.isSelectedSlot = jest.fn().mockReturnValue(false)
      service.isSlotAvailable = jest.fn().mockReturnValue(false)
      applicantService.findOne = jest.fn().mockResolvedValue({ roles: [{ role: { id: '2' } }] })
      const result = await service.getSlots('', 'applicant-1')
      expect(roleService.getMandatoryInterviewRoleIds).toHaveBeenCalled()
      expect(service.isSlotAvailable).toHaveBeenCalledWith(expect.anything(), ['2', '1'])
      expect(service.isSelectedSlot).toHaveBeenCalledWith(expect.anything(), 'applicant-1')
      expect(applicantService.getRecruitApplicantModels).not.toHaveBeenCalled()
      expect(result).toContainEqual({
        start: new Date('2024-07-29T16:00:00.000Z'),
        end: new Date('2024-07-29T16:30:00.000Z'),
        roles: undefined,
        interviewedAt: undefined,
        isAvailable: false,
        isSelected: false,
        applicants: undefined,
      })
    })
  })

  describe(RecruitInterviewService.prototype.isSelectedSlot.name, () => {
    it('should return true when selected', () => {
      const result = service.isSelectedSlot(slots, 'applicant-1')
      expect(result).toBe(true)
    })

    it('should return false when not selected', () => {
      const result = service.isSelectedSlot(slots, 'applicant-2')
      expect(result).toBe(false)
    })
  })

  describe(RecruitInterviewService.prototype.isSlotAvailable.name, () => {
    it('should return true when all roles are available', () => {
      const result = service.isSlotAvailable(slots, ['1', '2'])
      expect(result).toBe(true)
    })

    it('should return false when some roles are not available', () => {
      const result = service.isSlotAvailable(slots, ['1', '2', '3'])
      expect(result).toBe(false)
    })

    it('should return false when some roles are not available', () => {
      const result = service.isSlotAvailable(slots, ['3'])
      expect(result).toBe(false)
    })
  })
})
