import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'

export class NudStudentModel {
  @ApiPropertyOptional()
  profileId?: string

  @ApiProperty()
  studentId: string

  @ApiProperty()
  academicYear: number

  @ApiProperty()
  classYear: number

  @ApiPropertyOptional()
  className?: string

  @ApiPropertyOptional()
  rank?: number

  static fromEntity(entity: NudStudentEntity): NudStudentModel {
    return {
      profileId: entity.profileId ? ObjectIdUuidConverter.toHexString(entity.profileId) : undefined,
      studentId: entity.studentId,
      academicYear: entity.academicYear,
      classYear: entity.classYear,
      className: entity.className ?? undefined,
      rank: entity.rank ?? undefined,
    }
  }
}
