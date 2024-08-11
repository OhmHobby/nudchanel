import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { AuthGroups } from 'src/auth/auth-group.decorator'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(private readonly profilePhotoService: ProfilePhotoService) {}

  @Post('profile-photos')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups(['admin'])
  triggerPhotoProfileMigration() {
    return this.profilePhotoService.migrate()
  }
}
