import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, Length } from 'class-validator'

export class NudStudentParamDto {
  private static readonly STUDENT_ID_LENGTH = 8

  @ApiProperty({ type: String })
  @IsNumberString()
  @Length(NudStudentParamDto.STUDENT_ID_LENGTH, NudStudentParamDto.STUDENT_ID_LENGTH)
  studentId: string
}
