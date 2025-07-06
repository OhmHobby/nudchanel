import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { GoogleCalendarService } from 'src/google/google-calendar.service'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitFormService } from '../form/recruit-form.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitRoleService } from '../role/recruit-role.service'
import { RecruitInterviewService } from './recruit-interview.service'

jest.mock('../applicant/recruit-applicant.service')
jest.mock('../role/recruit-role.service')
jest.mock('../form/recruit-form.service')
jest.mock('src/google/google-calendar.service')
jest.mock('../moderator/recruit-moderator.service')
jest.mock('src/accounts/profile/profile.service')

describe(RecruitInterviewService.name, () => {
  let service: RecruitInterviewService
  let applicantService: RecruitApplicantService
  let roleService: RecruitRoleService
  let configService: ConfigService
  let formService: RecruitFormService

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
        ConfigService,
        RecruitApplicantService,
        RecruitRoleService,
        RecruitFormService,
        GoogleCalendarService,
        ProfileService,
        RecruitModeratorService,
      ],
    }).compile()

    service = module.get<RecruitInterviewService>(RecruitInterviewService)
    configService = module.get(ConfigService)
    applicantService = module.get(RecruitApplicantService)
    roleService = module.get(RecruitRoleService)
    formService = module.get(RecruitFormService)
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
    beforeEach(() => {
      service.isValidLeadTime = jest.fn().mockReturnValue(true)
    })

    it('should return true when all roles are available', () => {
      const result = service.isSlotAvailable(slots, ['1', '2'])
      expect(result).toBe(true)
    })

    it('should return true when all roles are available but ', () => {
      service.isValidLeadTime = jest.fn().mockReturnValue(false)
      const result = service.isSlotAvailable(slots, ['1', '2'])
      expect(result).toBe(false)
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

  describe(RecruitInterviewService.prototype.isValidLeadTime.name, () => {
    beforeEach(() => {
      configService.getOrThrow = jest.fn().mockReturnValue(24)
    })

    it('should return true when lead time more than configuration', () => {
      const result = service.isValidLeadTime(new Date('2025-07-14T21:00:00.000Z'), new Date('2025-07-13T21:00:00.000Z'))
      expect(result).toBe(true)
    })

    it('should return false when lead time less than configuration', () => {
      const result = service.isValidLeadTime(new Date('2025-07-14T21:00:00.000Z'), new Date('2025-07-13T21:00:01.000Z'))
      expect(result).toBe(false)
    })
  })

  describe(RecruitInterviewService.prototype.applicantBookingPrecheck.name, () => {
    beforeEach(() => {
      service.isValidLeadTime = jest.fn().mockReturnValue(true)
    })

    it('should now throw when all criteria met', () => {
      expect(() => service.applicantBookingPrecheck(true, 1)).not.toThrow()
    })

    it('should throw when 0 selected roles', () => {
      expect(() => service.applicantBookingPrecheck(true, 0)).toThrow()
    })

    it('should throw when form has not completed', () => {
      expect(() => service.applicantBookingPrecheck(false, 1)).toThrow()
    })
  })

  describe(RecruitInterviewService.prototype.isRebookSameSlot.name, () => {
    const startWhen = new Date('2025-07-14T21:00:00.000Z')
    const endWhen = new Date('2025-07-14T21:30:00.000Z')
    const roleId1 = 'role-1'
    const roleId2 = 'role-2'
    const roleId3 = 'role-3'
    const slots = [
      new RecruitInterviewSlotEntity({ startWhen, endWhen, roleId: roleId1 }),
      new RecruitInterviewSlotEntity({ startWhen, endWhen, roleId: roleId2 }),
    ]

    it('should return false when no roles selected', () => {
      expect(service.isRebookSameSlot([], [], startWhen, endWhen)).toBe(false)
    })

    it('should return true when book the same slot', () => {
      expect(service.isRebookSameSlot(slots, [roleId1, roleId2], startWhen, endWhen)).toBe(true)
    })

    it('should return false when change roles', () => {
      expect(service.isRebookSameSlot(slots, [roleId1, roleId3], startWhen, endWhen)).toBe(false)
    })

    it('should return false when deselect roles', () => {
      expect(service.isRebookSameSlot(slots, [roleId1], startWhen, endWhen)).toBe(false)
    })

    it('should return false when select more roles', () => {
      expect(service.isRebookSameSlot(slots, [roleId1, roleId2, roleId3], startWhen, endWhen)).toBe(false)
    })

    it('should return false when change slot time', () => {
      expect(service.isRebookSameSlot(slots, [roleId1, roleId2], new Date(), new Date())).toBe(false)
    })
  })

  describe(RecruitInterviewService.prototype.bookSlot.name, () => {
    const recruitId = 'recruitId'
    const applicantId = 'applicant-id'
    const startWhen = new Date('2025-07-14T21:00:00.000Z')
    const endWhen = new Date('2025-07-14T21:30:00.000Z')
    const selectedSlots = [
      new RecruitInterviewSlotEntity({ startWhen, endWhen, roleId: 'role-0' }),
      new RecruitInterviewSlotEntity({ startWhen, endWhen, roleId: 'role-1' }),
    ]

    beforeEach(() => {
      service.getSelectedSlots = jest.fn().mockResolvedValue([])
      formService.isApplicantFormCompleted = jest.fn().mockResolvedValue(true)
      applicantService.getSelectedRoleIds = jest.fn().mockResolvedValue(['role-1'])
      roleService.getMandatoryInterviewRoleIds = jest.fn().mockResolvedValue(['role-0'])
      service.isRebookSameSlot = jest.fn().mockReturnValue(false)
      service.applicantBookingPrecheck = jest.fn()
      service.leadTimePrecheck = jest.fn()
    })

    it('should book successfully', async () => {
      await service.bookSlot(recruitId, applicantId, startWhen, endWhen)
      expect(service.isRebookSameSlot).toHaveBeenCalledWith([], ['role-0', 'role-1'], startWhen, endWhen)
      expect(service.applicantBookingPrecheck).toHaveBeenCalledWith(true, 1)
      expect(dataSource.transaction).toHaveBeenCalled()
    })

    it('should re-book successfully', async () => {
      service.getSelectedSlots = jest.fn().mockResolvedValue(selectedSlots)
      service.isRebookSameSlot = jest.fn().mockReturnValue(true)
      await service.bookSlot(recruitId, applicantId)
      expect(service.isRebookSameSlot).toHaveBeenCalledWith(selectedSlots, ['role-0', 'role-1'], startWhen, endWhen)
      expect(service.leadTimePrecheck).not.toHaveBeenCalled()
      expect(service.applicantBookingPrecheck).toHaveBeenCalledWith(true, 1)
      expect(dataSource.transaction).not.toHaveBeenCalled()
    })

    it('should re-book with fail precheck should be failed', async () => {
      service.getSelectedSlots = jest.fn().mockResolvedValue(selectedSlots)
      service.applicantBookingPrecheck = jest.fn().mockImplementation(() => {
        throw new Error()
      })
      await expect(service.bookSlot(recruitId, applicantId)).rejects.toThrow()
      expect(service.applicantBookingPrecheck).toHaveBeenCalledWith(true, 1)
      expect(service.isRebookSameSlot).not.toHaveBeenCalled()
      expect(dataSource.transaction).not.toHaveBeenCalled()
    })

    it('throw when missing start or end when no selected roles', async () => {
      await expect(service.bookSlot(recruitId, applicantId)).rejects.toThrow()
      await expect(service.bookSlot(recruitId, applicantId, startWhen)).rejects.toThrow()
      await expect(service.bookSlot(recruitId, applicantId, undefined, endWhen)).rejects.toThrow()
      expect(service.isRebookSameSlot).not.toHaveBeenCalled()
      expect(service.applicantBookingPrecheck).not.toHaveBeenCalled()
      expect(dataSource.transaction).not.toHaveBeenCalled()
    })
  })

  describe('addSlot', () => {
    it('should create and save slots for each roleId', async () => {
      const saveMock = jest.fn()
      service['interviewSlotRepostory'].create = ((data: any) => data) as any
      service['interviewSlotRepostory'].save = saveMock
      const startWhen = new Date('2024-07-29T15:00:00.000Z')
      const endWhen = new Date('2024-07-29T15:30:00.000Z')
      const roleIds = ['role-1', 'role-2']
      await service.addSlot(startWhen, endWhen, roleIds)
      expect(saveMock).toHaveBeenCalledWith([
        { startWhen, endWhen, roleId: 'role-1' },
        { startWhen, endWhen, roleId: 'role-2' },
      ])
    })
  })

  describe('removeSlot', () => {
    it('should remove slots if none are booked', async () => {
      const findMock = jest.fn().mockResolvedValue([
        { id: '1', applicantId: null },
        { id: '2', applicantId: null },
      ])
      const removeMock = jest.fn()
      service['interviewSlotRepostory'].find = findMock
      service['interviewSlotRepostory'].remove = removeMock
      await service.removeSlot(new Date('2024-07-29T15:00:00.000Z'), new Date('2024-07-29T15:30:00.000Z'), [
        'role-1',
        'role-2',
      ])
      expect(removeMock).toHaveBeenCalled()
    })

    it('should throw ConflictException if any slot is booked', async () => {
      const findMock = jest.fn().mockResolvedValue([
        { id: '1', applicantId: 'applicant-1' },
        { id: '2', applicantId: null },
      ])
      service['interviewSlotRepostory'].find = findMock
      await expect(
        service.removeSlot(new Date('2024-07-29T15:00:00.000Z'), new Date('2024-07-29T15:30:00.000Z'), [
          'role-1',
          'role-2',
        ]),
      ).rejects.toThrow('Cannot remove slot: one or more slots are already booked')
    })
  })
})
