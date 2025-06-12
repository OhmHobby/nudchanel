import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from 'class-validator'

export class NudStudentParamDto {
  @ApiProperty({ type: String })
  @IsNumberString()
  studentId: string
}
