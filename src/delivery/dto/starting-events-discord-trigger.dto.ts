import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate } from 'class-validator'

export class StartingEventsDiscordTriggerDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  now: Date

  @ApiProperty({ example: true })
  @IsBoolean()
  dryrun: boolean
}
