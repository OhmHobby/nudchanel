import { ApiProperty } from '@nestjs/swagger'
import { Matches } from 'class-validator'

export class BookRecruitInterviewSlotDto {
  @ApiProperty()
  @Matches(/^[a-z0-9]+\-[a-z0-9]+$/, { message: 'Invalid refId' })
  refId: string
}
