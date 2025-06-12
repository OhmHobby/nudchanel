import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileId } from 'src/models/types'
import { Repository } from 'typeorm'

@Injectable()
export class NudStudentService {
  private readonly logger = new Logger(NudStudentService.name)

  private readonly maximumStudentsPerProfile = 2

  constructor(
    @InjectRepository(NudStudentEntity)
    private readonly nudStudentRepository: Repository<NudStudentEntity>,
  ) {}

  getStudents(profileId: ProfileId): Promise<NudStudentEntity[]> {
    return this.nudStudentRepository.find({
      where: {
        profileId: ObjectIdUuidConverter.toUuid(profileId),
      },
    })
  }

  getStudent(studentId: string): Promise<NudStudentEntity | null> {
    return this.nudStudentRepository.findOne({
      where: {
        studentId,
      },
    })
  }

  async updateStudent(entity: NudStudentEntity): Promise<void> {
    if (!entity.profileId) throw new BadRequestException('Profile ID is required')
    const [profileStudents, student] = await Promise.all([
      this.getStudents(ObjectIdUuidConverter.toObjectId(entity.profileId)),
      this.getStudent(entity.studentId),
    ])
    if (profileStudents.filter((el) => el.studentId !== entity.studentId).length >= this.maximumStudentsPerProfile)
      throw new BadRequestException('You have reached the maximum number of students')
    if (!student?.studentId) {
      await this.nudStudentRepository.save(entity)
      return
    }
    if (student.profileId !== entity.profileId)
      throw new BadRequestException('Student ID is not belong to your profile')
    await this.nudStudentRepository.update(student.id, entity)
  }
}
