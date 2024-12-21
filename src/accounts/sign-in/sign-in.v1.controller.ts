import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { AccessTokenService } from '../access-token/access-token.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { UserLocalService } from '../user/user-local.service'
import { SignInCodeDto } from './dto/sign-in-code.dto'
import { SignInLocalUserRequestDto } from './dto/sign-in-local-user-request.dto'
import { SignInLocalUserResponseDto, SignInStatus } from './dto/sign-in-local-user-response.dto'
import { SignInService } from './sign-in.service'

@Controller({ path: 'accounts/sign-in', version: '1' })
@ApiTags('SignInV1')
export class SignInV1Controller {
  private readonly logger = new Logger(SignInV1Controller.name)

  constructor(
    private readonly signInService: SignInService,
    private readonly userLocalService: UserLocalService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  @Get()
  @ApiFoundResponse()
  async signInWithCode(
    @Res({ passthrough: true }) response: Pick<Response, 'cookie' | 'redirect'>,
    @Query() { code, continue: redirectTo }: SignInCodeDto,
  ) {
    const profileId = await this.signInService.useCode(code)
    if (!profileId) throw new UnauthorizedException('Code expired')
    await this.setAccessRefreshTokenCookiesByProfile(response, profileId, true)
    this.logger.log({ message: 'Successful sign-in', profileId }, SignInV1Controller.prototype.signInWithCode.name)
    response.redirect(HttpStatus.FOUND, redirectTo)
  }

  @Post('/local')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SignInLocalUserResponseDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid credential' })
  async signInWithLocalUser(
    @Body() { username, password, persistent }: SignInLocalUserRequestDto,
    @Res({ passthrough: true }) response: Pick<Response, 'cookie'>,
  ): Promise<SignInLocalUserResponseDto> {
    const user = await this.userLocalService.signIn(username, password)
    const profileId = user.profile!.toString()
    await this.setAccessRefreshTokenCookiesByProfile(response, profileId, !persistent)
    this.logger.log(
      { message: 'Successful sign-in', username, persistent },
      SignInV1Controller.prototype.signInWithLocalUser.name,
    )
    return { status: SignInStatus.ok }
  }

  private async setAccessRefreshTokenCookiesByProfile(
    response: Pick<Response, 'cookie'>,
    profileId: string,
    isSession = false,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenService.generateAccessToken(profileId),
      this.refreshTokenService.create(profileId, isSession),
    ])
    if (!refreshToken._id) throw new Error('Failed to create refreshToken')
    const expires = this.refreshTokenService.tokenCookieExpires(refreshToken)
    this.accessTokenService.setHttpAccessTokenCookie(response, accessToken, expires)
    this.refreshTokenService.setHttpRefreshTokenCookie(response, refreshToken._id.toString(), expires)
  }
}
