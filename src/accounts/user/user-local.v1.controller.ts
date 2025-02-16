import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ProfileIdModel } from '../models/profile-id.model'
import { ChangeLocalUserPasswordDto } from './dto/change-local-user-password.dto'
import { UserLocalService } from './user-local.service'

@Controller({ path: 'accounts/users/local', version: '1' })
@ApiTags('LocalUserV1')
export class LocalUserV1Controller {
  constructor(private readonly userLocalService: UserLocalService) {}

  @Patch('password')
  @AuthGroups()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async changeLocalUserPassword(
    @Body() { currentPassword, newPassword }: ChangeLocalUserPasswordDto,
    @UserCtx() user: User,
  ): Promise<void> {
    await this.userLocalService.verifyAndChangePassword(
      ProfileIdModel.fromObjectId(user.id)!.objectId,
      currentPassword,
      newPassword,
    )
  }
}
