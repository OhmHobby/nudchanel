import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { AuthGroups } from 'src/auth/auth-group.decorator'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(private readonly discordProcessorService: DiscordProcessorService) {}

  @Post('profile-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerDiscordProfileSyncAll() {
    return await this.discordProcessorService.triggerProfileSyncAll()
  }
}
