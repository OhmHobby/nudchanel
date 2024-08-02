import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpcomingEventDiscordTriggerDto {
  @ApiPropertyOptional()
  hourLookAhead?: number

  @ApiPropertyOptional()
  range?: number

  @ApiPropertyOptional({ default: false })
  dryrun?: boolean
}
