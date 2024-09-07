import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { MigrationProcessorService } from './migration-processor.service'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(private readonly service: MigrationProcessorService) {}

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
