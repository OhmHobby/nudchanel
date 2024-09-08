import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger'
import { Snowflake } from 'discord.js'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { DiscordBotService } from './discord-bot.service'
import { DiscordService } from './discord.service'
import { StartingEventsDiscordTriggerDto } from './dto/starting-events-discord-trigger.dto'
import { UpcomingEventsDiscordTriggerDto } from './dto/upcoming-events-discord-trigger.dto'
import { DiscordEmbedEvent } from './events-notifier/discord-embed-event.model'
import { DiscortEventsNotifierService } from './events-notifier/discord-events-notifier.service'

@Controller('discord')
@ApiTags('Discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
    private readonly discordBotService: DiscordBotService,
    private readonly discordUpcomingEventService: DiscortEventsNotifierService,
  ) {}

  @Get('users/@me')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  getDiscordCurrentUser() {
    return this.discordBotService.getCurrentUser()
  }

  @Get('users/:userId')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  getDiscordUserById(@Param('userId') userId: Snowflake) {
    return this.discordBotService.getUserById(userId)
  }

  @Get('roles')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  getDiscordRoles() {
    return this.discordBotService.getRoles()
  }

  @Post('profile-sync/:discordId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  async triggerDiscordProfileSync(@Param('discordId') discordId: Snowflake) {
    await this.discordService.triggerProfileNameSync(discordId)
    await this.discordService.triggerProfileRoleSync(discordId)
  }

  @Post('profile-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  async triggerDiscordProfileSyncAll(@Query('delayMs') delay: string) {
    return await this.discordService.triggerProfileSyncAll(+delay)
  }

  @Post('role-sync')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  triggerDiscordRoleSyncAll() {
    return this.discordService.triggerRoleSyncAll()
  }

  @ApiProperty()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [DiscordEmbedEvent] })
  @Post('upcoming-events')
  @AuthGroups('it')
  triggerDiscordUpcomingEvents(
    @Body() { hourLookAhead, range, dryrun }: UpcomingEventsDiscordTriggerDto,
  ): Promise<DiscordEmbedEvent[]> {
    return this.discordUpcomingEventService.triggerUpcoming(hourLookAhead, range, dryrun)
  }

  @ApiProperty()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [DiscordEmbedEvent] })
  @Post('starting-events')
  @AuthGroups('it')
  triggerDiscordStartingEvents(@Body() { now, dryrun }: StartingEventsDiscordTriggerDto): Promise<DiscordEmbedEvent[]> {
    return this.discordUpcomingEventService.triggerStaring(now, dryrun)
  }
}
