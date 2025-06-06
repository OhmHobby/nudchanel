import { Test, TestingModule } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitFormAnswerEntity } from 'src/entities/recruit/recruit-form-answer.entity'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { AnswerRecruitFormQuestionDto } from '../dto/answer-recruit-form-question.dto'
import { RecruitFormCollectionModel } from '../models/recruit-form-collection.model'
import { RecruitFormService } from './recruit-form.service'
import { RecruitInterviewService } from '../interview/recruit-interview.service'

jest.mock('../interview/recruit-interview.service')

describe(RecruitFormService.name, () => {
  let service: RecruitFormService
  const dataSource = {
    transaction: jest.fn(),
  }
  const roleEntity = { find: jest.fn() }
  const applicantRoleEntity = { find: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitFormService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(RecruitRoleEntity), useValue: roleEntity },
        { provide: getRepositoryToken(RecruitFormCollectionEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(RecruitFormQuestionEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(RecruitApplicantRoleEntity), useValue: applicantRoleEntity },
        RecruitInterviewService,
      ],
    }).compile()

    service = module.get<RecruitFormService>(RecruitFormService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(RecruitFormService.prototype.getMandatoryCollections.name, () => {
    it('should return empty when no mandatory forms', async () => {
      roleEntity.find = jest.fn().mockResolvedValue([])
      const result = await service.getMandatoryCollections('')
      expect(result).toEqual([])
    })

    it('should return empty when it fails to populate the collection', async () => {
      roleEntity.find = jest.fn().mockResolvedValue([new RecruitRoleEntity({ id: '1' })])
      const result = await service.getMandatoryCollections('')
      expect(result).toEqual([])
    })

    it('should return collections correctly', async () => {
      roleEntity.find = jest
        .fn()
        .mockResolvedValue([new RecruitRoleEntity({ id: '1', collection: new RecruitFormCollectionEntity() })])
      const result = await service.getMandatoryCollections('')
      expect(result[0]).toBeInstanceOf(RecruitFormCollectionEntity)
    })
  })

  describe(RecruitFormService.prototype.getApplicantSelectedRoleFormCollections.name, () => {
    it('should return applicant does not select any roles', async () => {
      applicantRoleEntity.find = jest.fn().mockResolvedValue([])
      const result = await service.getApplicantSelectedRoleFormCollections('')
      expect(result).toEqual([])
    })

    it('should return applicant selects role with form', async () => {
      applicantRoleEntity.find = jest.fn().mockResolvedValue([
        new RecruitApplicantRoleEntity({
          role: new RecruitRoleEntity({ collection: new RecruitFormCollectionEntity() }),
        }),
      ])
      const result = await service.getApplicantSelectedRoleFormCollections('')
      expect(result[0]).toBeInstanceOf(RecruitFormCollectionEntity)
    })

    it('should return applicant selects role without form', async () => {
      applicantRoleEntity.find = jest.fn().mockResolvedValue([new RecruitApplicantRoleEntity()])
      const result = await service.getApplicantSelectedRoleFormCollections('')
      expect(result).toEqual([])
    })
  })

  describe(RecruitFormService.prototype.getApplicantFormCollectionWithCompletions.name, () => {
    it('should return only mandatory when roles return empty collection', async () => {
      service.getMandatoryCollections = jest.fn().mockResolvedValue([new RecruitFormCollectionEntity({ id: 'form-0' })])
      service.getApplicantSelectedRoleFormCollections = jest.fn().mockResolvedValue([])
      service.getCompletionMap = jest.fn().mockResolvedValue(new Map([['form-0', true]]))
      const result = await service.getApplicantFormCollectionWithCompletions('applicant-id', 'recruit-id')
      expect(service.getCompletionMap).toHaveBeenCalledWith('applicant-id', ['form-0'])
      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(RecruitFormCollectionModel)
      expect(result[0]).toEqual(expect.objectContaining({ id: 'form-0', isCompleted: true }))
    })
  })

  describe(RecruitFormService.prototype.isApplicantFormCompleted.name, () => {
    it('should return true when all are completed', async () => {
      service.getApplicantFormCollectionWithCompletions = jest
        .fn()
        .mockResolvedValue([
          new RecruitFormCollectionModel({ id: 'form-0', isCompleted: true }),
          new RecruitFormCollectionModel({ id: 'form-1', isCompleted: true }),
        ])
      const result = await service.isApplicantFormCompleted('applicant-id', 'recruit-id')
      expect(result).toBe(true)
    })

    it('should return false when some are completed', async () => {
      service.getApplicantFormCollectionWithCompletions = jest
        .fn()
        .mockResolvedValue([
          new RecruitFormCollectionModel({ id: 'form-0', isCompleted: true }),
          new RecruitFormCollectionModel({ id: 'form-1', isCompleted: false }),
        ])
      const result = await service.isApplicantFormCompleted('applicant-id', 'recruit-id')
      expect(result).toBe(false)
    })

    it('should return true when no form required', async () => {
      service.getApplicantFormCollectionWithCompletions = jest.fn().mockResolvedValue([])
      const result = await service.isApplicantFormCompleted('applicant-id', 'recruit-id')
      expect(result).toBe(true)
    })
  })

  describe(RecruitFormService.prototype.shouldAnswerBeDeleted.name, () => {
    it('should return false when answer correctly', () => {
      expect(service.shouldAnswerBeDeleted('test')).toBe(false)
    })

    it('should return true when answer is empty', () => {
      expect(service.shouldAnswerBeDeleted('    ')).toBe(true)
    })

    it('should return true when answer with repeated string', () => {
      expect(service.shouldAnswerBeDeleted('  ------  ')).toBe(true)
    })

    it('should return true when answer with only one character', () => {
      expect(service.shouldAnswerBeDeleted('  ?  ')).toBe(true)
    })
    it('should return true when answer is undefined', () => {
      expect(service.shouldAnswerBeDeleted()).toBe(true)
    })
  })

  describe(RecruitFormService.prototype.updateFormAnswers.name, () => {
    const find = jest.fn()
    const upsert = jest.fn()
    const mockDelete = jest.fn()
    const applicant = new RecruitApplicantEntity({ id: 'applicant-id' })

    beforeEach(() => {
      dataSource.transaction = jest.fn().mockImplementation((cb) =>
        Promise.resolve(
          cb({
            getRepository: jest.fn().mockReturnValue({ find, upsert, delete: mockDelete }),
          }),
        ),
      )
      service.shouldAnswerBeDeleted = jest.fn().mockReturnValue(false)
    })

    it('should upsert and delete correctly', async () => {
      service.shouldAnswerBeDeleted = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      find.mockResolvedValue([
        new RecruitFormAnswerEntity({ id: 'ans-1', questionId: '1' }),
        new RecruitFormAnswerEntity({ id: 'ans-2', questionId: '2' }),
        new RecruitFormAnswerEntity({ id: 'ans-4', questionId: '4' }),
      ])
      await service.updateFormAnswers(applicant, [
        new AnswerRecruitFormQuestionDto({ questionId: '1', answer: 'answer-1' }),
        new AnswerRecruitFormQuestionDto({ questionId: '2', answer: '2' }),
        new AnswerRecruitFormQuestionDto({ questionId: '3', answer: 'answer-3' }),
      ])
      expect(upsert).toHaveBeenCalledWith(
        [
          expect.objectContaining({ id: 'ans-1', questionId: '1', applicantId: applicant.id, answer: 'answer-1' }),
          expect.objectContaining({ questionId: '3', applicantId: applicant.id, answer: 'answer-3' }),
        ],
        expect.anything(),
      )
      expect(mockDelete).toHaveBeenCalledWith(['ans-2'])
    })

    it('should not call when no insert or delete', async () => {
      find.mockResolvedValue([
        new RecruitFormAnswerEntity({ id: 'ans-1', questionId: '1' }),
        new RecruitFormAnswerEntity({ id: 'ans-2', questionId: '2' }),
      ])
      await service.updateFormAnswers(applicant, [])
      expect(upsert).not.toHaveBeenCalled()
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })
})
