import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Snowflake } from 'discord.js'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { DiscordBotService } from './discord-bot.service'
import { DiscordService } from './discord.service'

@Controller('discord')
@ApiTags('Discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
    private readonly discordBotService: DiscordBotService,
  ) {}

  @Get('users/@me')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  getDiscordCurrentUser() {
    return this.discordBotService.getCurrentUser()
  }

  @Get('users/:userId')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  getDiscordUserById(@Param('userId') userId: Snowflake) {
    return this.discordBotService.getUserById(userId)
  }

  @Get('roles')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  getDiscordRoles() {
    return this.discordBotService.getRoles()
  }

  @Post('profile-sync/:discordId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerDiscordProfileSync(@Param('discordId') discordId: Snowflake) {
    await this.discordService.triggerProfileNameSync(discordId)
    await this.discordService.triggerProfileRoleSync(discordId)
  }

  @Post('profile-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerDiscordProfileSyncAll(@Query('delayMs') delay: string) {
    return await this.discordService.triggerProfileSyncAll(+delay)
  }

  @Post('role-sync')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  triggerDiscordRoleSyncAll() {
    return this.discordService.triggerRoleSyncAll()
  }
}
