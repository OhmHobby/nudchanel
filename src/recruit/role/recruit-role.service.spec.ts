import { Test, TestingModule } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { RecruitRoleService } from './recruit-role.service'
import { RecruitInterviewService } from '../interview/recruit-interview.service'

jest.mock('../interview/recruit-interview.service')

describe(RecruitRoleService.name, () => {
  let service: RecruitRoleService
  const dataSource = {
    transaction: jest.fn(),
  }
  const recruitRoleRepository = {
    find: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitRoleService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(RecruitRoleEntity), useValue: recruitRoleRepository },
        RecruitInterviewService,
      ],
    }).compile()

    service = module.get<RecruitRoleService>(RecruitRoleService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RecruitRoleService.prototype.selectRoles.name, () => {
    const dataSourceSave = jest.fn()
    const dataSourceDelete = jest.fn()

    beforeEach(() => {
      jest.resetAllMocks()
    })

    const applicant = new RecruitApplicantEntity()
    const applicantId = applicant.id
    const role1 = 'role-1'
    const role2 = 'role-2'

    test('No role selected => select no roles', async () => {
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            save: dataSourceSave,
            delete: dataSourceDelete,
            getRepository: jest.fn().mockReturnValue({ find: jest.fn().mockResolvedValue([]) }),
          }),
        ),
      )
      await service.selectRoles(applicant, [])
      expect(dataSourceSave).not.toHaveBeenCalled()
      expect(dataSourceDelete).not.toHaveBeenCalled()
    })

    test('No role selected => select new 2 roles', async () => {
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            save: dataSourceSave,
            delete: dataSourceDelete,
            getRepository: jest.fn().mockReturnValue({ find: jest.fn().mockResolvedValue([]) }),
          }),
        ),
      )
      await service.selectRoles(applicant, [role1, role2])
      expect(dataSourceSave).toHaveBeenCalledWith([
        expect.objectContaining({ rank: 0, applicantId, roleId: role1 }),
        expect.objectContaining({ rank: 1, applicantId, roleId: role2 }),
      ])
      expect(dataSourceDelete).not.toHaveBeenCalled()
    })

    test('Selected role 1 => select same role', async () => {
      const selectedRoles = [new RecruitApplicantRoleEntity({ rank: 0, applicantId, roleId: role1 })]
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            save: dataSourceSave,
            delete: dataSourceDelete,
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue(selectedRoles),
            }),
          }),
        ),
      )
      await service.selectRoles(applicant, [role1])
      expect(dataSourceSave).toHaveBeenCalledWith([
        expect.objectContaining({ id: selectedRoles[0].id, rank: 0, applicantId, roleId: role1 }),
      ])
      expect(dataSourceDelete).not.toHaveBeenCalled()
    })

    test('Selected role 1 => change to role 2', async () => {
      const selectedRoles = [new RecruitApplicantRoleEntity({ rank: 0, applicantId, roleId: role1 })]
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            save: dataSourceSave,
            delete: dataSourceDelete,
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue(selectedRoles),
            }),
          }),
        ),
      )
      await service.selectRoles(applicant, [role2])
      expect(dataSourceSave).toHaveBeenCalledWith([
        expect.objectContaining({ id: selectedRoles[0].id, rank: 0, applicantId, roleId: role2 }),
      ])
      expect(dataSourceDelete).not.toHaveBeenCalled()
    })

    test('Selected 2 roles => change to 1', async () => {
      const selectedRoles = [
        new RecruitApplicantRoleEntity({ rank: 0, applicantId, roleId: role1 }),
        new RecruitApplicantRoleEntity({ rank: 1, applicantId, roleId: role2 }),
      ]
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            save: dataSourceSave,
            delete: dataSourceDelete,
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue(selectedRoles),
            }),
          }),
        ),
      )
      await service.selectRoles(applicant, [role2])
      expect(dataSourceSave).toHaveBeenCalledWith([
        expect.objectContaining({ id: selectedRoles[0].id, rank: 0, applicantId, roleId: role2 }),
      ])
      expect(dataSourceDelete).toHaveBeenCalledWith(RecruitApplicantRoleEntity, [{ id: selectedRoles[1].id }])
    })
  })
})
