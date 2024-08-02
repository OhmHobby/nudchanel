import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { DiscordEmbedEvent } from './discord-upcoming-event/discord-embed-event.model'
import { DiscordUpcomingEventService } from './discord-upcoming-event/discord-upcoming-event.service'
import { UpcomingEventDiscordTriggerDto } from './dto/upcoming-events-discord-trigger.dto'

@Controller({ path: 'delivery', version: '1' })
@ApiTags('DeliveryV1')
export class DeliveryV1Controller {
  constructor(private readonly discordUpcomingEventService: DiscordUpcomingEventService) {}

  @ApiProperty()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [DiscordEmbedEvent] })
  @Post('upcoming-events/discord')
  @AuthGroups(['it'])
  triggerWebhook(
    @Body() { hourLookAhead, range, dryrun }: UpcomingEventDiscordTriggerDto,
  ): Promise<DiscordEmbedEvent[]> {
    return this.discordUpcomingEventService.triggerWebhook(hourLookAhead, range, dryrun)
  }
}
