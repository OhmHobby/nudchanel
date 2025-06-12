import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('nud_students')
@Unique('UNIQUE_STUDENT_PROFILE_YEAR', ['studentId', 'profileId', 'academicYear'])
export class NudStudentEntity extends BaseEntity {
  constructor(entity?: DeepPartial<NudStudentEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'uuid', name: 'profile_id', nullable: true })
  profileId?: string | null

  @Column({ type: 'text', name: 'student_id' })
  studentId: string

  @Column({ type: 'integer', name: 'academic_year' })
  academicYear: number

  @Column({ type: 'integer', name: 'class_year' })
  classYear: number

  @Column({ type: 'text', name: 'class_name', nullable: true })
  className?: string | null

  @Column({ type: 'integer', nullable: true })
  rank?: number | null
}
