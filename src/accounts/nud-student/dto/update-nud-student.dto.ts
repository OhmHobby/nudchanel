import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, Validate } from 'class-validator'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { transformProfileIdModel } from 'src/helpers/transform-profile-id-model'

export class UpdateNudStudentDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(transformProfileIdModel)
  @Validate(IsForbiddenField, ['nudch'])
  profileId?: ProfileIdModel

  @ApiProperty()
  @IsNumber()
  academicYear: number

  @ApiProperty()
  @IsNumber()
  classYear: number

  @ApiProperty()
  className: string

  @ApiProperty()
  rank: number

  toEntity(studentId: string, profileId: string): NudStudentEntity {
    return new NudStudentEntity({
      studentId,
      profileId,
      academicYear: this.academicYear,
      classYear: this.classYear,
      className: this.className,
      rank: this.rank,
    })
  }
}
