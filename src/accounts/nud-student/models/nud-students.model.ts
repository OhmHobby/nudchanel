import { ApiProperty } from '@nestjs/swagger'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { NudStudentModel } from './nud-student.model'

export class NudStudentsModel {
  @ApiProperty({ type: [NudStudentModel] })
  students: NudStudentModel[]

  static fromEntities(entities: NudStudentEntity[]): NudStudentsModel {
    return {
      students: entities.map(NudStudentModel.fromEntity),
    }
  }
}
