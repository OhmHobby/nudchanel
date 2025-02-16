import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Patch, Post } from '@nestjs/common'
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ProfileIdModel } from '../models/profile-id.model'
import { ChangeLocalUserPasswordDto } from './dto/change-local-user-password.dto'
import { RequestLocalUserDto } from './dto/request-local-user.dto'
import { LocalUserModel } from './models/local-user.model'
import { UserLocalService } from './user-local.service'

@Controller({ path: 'accounts/users/local', version: '1' })
@ApiTags('LocalUserV1')
export class LocalUserV1Controller {
  constructor(private readonly userLocalService: UserLocalService) {}

  @Get()
  @AuthGroups('nudch')
  @ApiOkResponse({ type: LocalUserModel })
  async getLocalUser(@UserCtx() user: User): Promise<LocalUserModel> {
    const profileId = ProfileIdModel.fromObjectId(user.id)!.objectId
    const localUser = await this.userLocalService.findByProfile(profileId)
    if (!localUser) throw new NotFoundException()
    return new LocalUserModel({ username: localUser.username })
  }

  @Post()
  @AuthGroups('nudch')
  @ApiOkResponse({ type: LocalUserModel })
  async requestLocalUser(@Body() { newPassword }: RequestLocalUserDto, @UserCtx() user: User): Promise<LocalUserModel> {
    const profileId = ProfileIdModel.fromObjectId(user.id)!.objectId
    const username = await this.userLocalService.requestUsername(profileId)
    await this.userLocalService.create(username, newPassword, profileId)
    return new LocalUserModel({ username })
  }

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
