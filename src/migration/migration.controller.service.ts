import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { MigrationService } from './migration.service'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor(private readonly service: MigrationService) {}

  @Get('data')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async getDataMigrations() {
    return await this.service.getDataMigrations()
  }

  @Post('data/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  async triggerDataMigration(@Param('name') name: string) {
    await this.service.triggerDataMigration(name)
  }
}
