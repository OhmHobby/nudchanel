import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class YearTeamMemberDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  year: number
}
