import { Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { AuthGroups } from 'src/auth/auth-group.decorator'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(
    private readonly discordProcessorService: DiscordProcessorService,
    private readonly profilePhotoService: ProfilePhotoService,
  ) {}

  @Post('profile-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerDiscordProfileSyncAll(@Query('delayMs') delay: string) {
    return await this.discordProcessorService.triggerProfileSyncAll(+delay)
  }

  @Post('profile-photo')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  triggerFixOutdatedProfilePhotos() {
    return this.profilePhotoService.fixOutdatedProfilePhotos()
  }
}
