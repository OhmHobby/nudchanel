import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsUUID } from 'class-validator'

export class AddRecruitInterviewSlotDto {
  @ApiProperty({ description: 'Start time of the interview slot' })
  @IsDateString()
  startWhen: string

  @ApiProperty({ description: 'End time of the interview slot' })
  @IsDateString()
  endWhen: string

  @ApiProperty({ description: 'Role IDs for this slot', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds: string[]
}
