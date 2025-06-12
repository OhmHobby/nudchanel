import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { Repository } from 'typeorm'
import { NudStudentService } from './nud-student.service'

// Mock ObjectIdUuidConverter
jest.mock('src/helpers/objectid-uuid-converter')
const mockedObjectIdUuidConverter = ObjectIdUuidConverter as jest.Mocked<typeof ObjectIdUuidConverter>

describe(NudStudentService.name, () => {
  let service: NudStudentService
  let repository: jest.Mocked<Repository<NudStudentEntity>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NudStudentService,
        {
          provide: getRepositoryToken(NudStudentEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<NudStudentService>(NudStudentService)
    repository = module.get(getRepositoryToken(NudStudentEntity))

    // Reset mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(NudStudentService.prototype.updateStudent.name, () => {
    const mockProfileId = 'profile-uuid-123'
    const mockObjectId = 'object-id-123'
    const mockStudentId = 'student-123'

    beforeEach(() => {
      mockedObjectIdUuidConverter.toObjectId.mockReturnValue(mockObjectId as any)
      mockedObjectIdUuidConverter.toUuid.mockReturnValue(mockProfileId)
    })

    describe('validation cases', () => {
      it('should throw BadRequestException when profileId is missing', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          academicYear: 2024,
          classYear: 1,
          // profileId is missing
        })

        await expect(service.updateStudent(entity)).rejects.toThrow(new BadRequestException('Profile ID is required'))
      })

      it('should throw BadRequestException when profileId is null', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          academicYear: 2024,
          classYear: 1,
          profileId: null,
        })

        await expect(service.updateStudent(entity)).rejects.toThrow(new BadRequestException('Profile ID is required'))
      })

      it('should throw BadRequestException when student ID does not belong to the profile', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 1,
        })

        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: mockStudentId,
          profileId: 'different-profile-id',
          academicYear: 2024,
          classYear: 1,
        })

        repository.find.mockResolvedValue([])
        repository.findOne.mockResolvedValue(existingStudent)

        await expect(service.updateStudent(entity)).rejects.toThrow(
          new BadRequestException('Student ID is not belong to your profile'),
        )
      })

      it('should throw BadRequestException when maximum students per profile is reached', async () => {
        const entity = new NudStudentEntity({
          studentId: 'new-student-123',
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 1,
        })

        // Mock profile having 2 students already (maximum)
        const existingStudents = [
          new NudStudentEntity({
            id: 1,
            studentId: 'student-1',
            profileId: mockProfileId,
            academicYear: 2024,
            classYear: 1,
          }),
          new NudStudentEntity({
            id: 2,
            studentId: 'student-2',
            profileId: mockProfileId,
            academicYear: 2024,
            classYear: 2,
          }),
        ]

        repository.find.mockResolvedValue(existingStudents)
        repository.findOne.mockResolvedValue(null) // New student, doesn't exist

        await expect(service.updateStudent(entity)).rejects.toThrow(
          new BadRequestException('You have reached the maximum number of students'),
        )
      })
    })

    describe('success cases', () => {
      it('should update an existing student', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 2,
          className: 'Updated Class',
        })

        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
          className: 'Old Class',
        })

        // Mock one existing student in profile (under limit)
        const profileStudents = [existingStudent]

        repository.find.mockResolvedValue(profileStudents)
        repository.findOne.mockResolvedValue(existingStudent)
        repository.update.mockResolvedValue(undefined as any)

        await service.updateStudent(entity)

        expect(repository.update).toHaveBeenCalledWith(existingStudent.id, entity)
        expect(repository.save).not.toHaveBeenCalled()
      })

      it('should create a new student when student does not exist', async () => {
        const entity = new NudStudentEntity({
          studentId: 'new-student-456',
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 1,
          className: 'New Class',
        })

        // Mock one existing student in profile (under limit)
        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: 'existing-student',
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
        })

        repository.find.mockResolvedValue([existingStudent])
        repository.findOne.mockResolvedValue(null) // New student doesn't exist
        repository.save.mockResolvedValue(entity)

        await service.updateStudent(entity)

        expect(repository.save).toHaveBeenCalledWith(entity)
        expect(repository.update).not.toHaveBeenCalled()
      })

      it('should allow updating when student exists and profile has exactly maximum students', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 2,
        })

        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
        })

        const anotherStudent = new NudStudentEntity({
          id: 2,
          studentId: 'another-student',
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
        })

        // Profile has 2 students (maximum), but we're updating one of them
        const profileStudents = [existingStudent, anotherStudent]

        repository.find.mockResolvedValue(profileStudents)
        repository.findOne.mockResolvedValue(existingStudent)
        repository.update.mockResolvedValue(undefined as any)

        await service.updateStudent(entity)

        expect(repository.update).toHaveBeenCalledWith(existingStudent.id, entity)
        expect(repository.save).not.toHaveBeenCalled()
      })

      it('should create a new student when profile has less than maximum students', async () => {
        const entity = new NudStudentEntity({
          studentId: 'new-student-789',
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 1,
        })

        // Profile has only 1 student (under limit)
        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: 'existing-student',
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
        })

        repository.find.mockResolvedValue([existingStudent])
        repository.findOne.mockResolvedValue(null) // New student doesn't exist
        repository.save.mockResolvedValue(entity)

        await service.updateStudent(entity)

        expect(repository.save).toHaveBeenCalledWith(entity)
        expect(repository.update).not.toHaveBeenCalled()
      })
    })

    describe('ObjectIdUuidConverter integration', () => {
      it('should call ObjectIdUuidConverter.toObjectId with profileId', async () => {
        const entity = new NudStudentEntity({
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2024,
          classYear: 1,
        })

        const existingStudent = new NudStudentEntity({
          id: 1,
          studentId: mockStudentId,
          profileId: mockProfileId,
          academicYear: 2023,
          classYear: 1,
        })

        repository.find.mockResolvedValue([existingStudent])
        repository.findOne.mockResolvedValue(existingStudent)
        repository.update.mockResolvedValue(undefined as any)

        await service.updateStudent(entity)

        expect(mockedObjectIdUuidConverter.toObjectId).toHaveBeenCalledWith(mockProfileId)
      })
    })
  })
})
