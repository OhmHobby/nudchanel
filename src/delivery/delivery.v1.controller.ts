import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { DiscordEmbedEvent } from './discord-events-notifier/discord-embed-event.model'
import { DiscortEventsNotifierService } from './discord-events-notifier/discord-events-notifier.service'
import { StartingEventsDiscordTriggerDto } from './dto/starting-events-discord-trigger.dto'
import { UpcomingEventsDiscordTriggerDto } from './dto/upcoming-events-discord-trigger.dto'

@Controller({ path: 'delivery', version: '1' })
@ApiTags('DeliveryV1')
export class DeliveryV1Controller {
  constructor(private readonly discordUpcomingEventService: DiscortEventsNotifierService) {}

  @ApiProperty()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [DiscordEmbedEvent] })
  @Post('upcoming-events/discord')
  @AuthGroups(['it'])
  triggerDiscordUpcomingEvents(
    @Body() { hourLookAhead, range, dryrun }: UpcomingEventsDiscordTriggerDto,
  ): Promise<DiscordEmbedEvent[]> {
    return this.discordUpcomingEventService.triggerUpcoming(hourLookAhead, range, dryrun)
  }

  @ApiProperty()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [DiscordEmbedEvent] })
  @Post('starting-events/discord')
  @AuthGroups(['it'])
  triggerDiscordStartingEvents(@Body() { now, dryrun }: StartingEventsDiscordTriggerDto): Promise<DiscordEmbedEvent[]> {
    return this.discordUpcomingEventService.triggerStaring(now, dryrun)
  }
}
