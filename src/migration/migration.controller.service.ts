import { Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { DiscordProcessorService } from 'src/accounts/discord/discord-processor.service'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { MigrationProcessorService } from './migration-processor.service'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(
    private readonly service: MigrationProcessorService,
    private readonly discordProcessorService: DiscordProcessorService,
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

  @Post('reprocess-photos')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerMigratePhotoStorageAll() {
    return await this.service.triggerReprocessAll()
  }

  @Post('reprocess-profile-photos')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['it'])
  async triggerReprocessProfilesAll() {
    return await this.service.triggerProcessAllProfilePhotos()
  }
}
