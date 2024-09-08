import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber } from 'class-validator'

export class UpcomingEventsDiscordTriggerDto {
  @ApiProperty()
  @IsNumber()
  hourLookAhead: number

  @ApiProperty()
  @IsNumber()
  range: number

  @ApiProperty({ example: true })
  @IsBoolean()
  dryrun: boolean
}
