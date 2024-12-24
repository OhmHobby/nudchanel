import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { Config } from 'src/enums/config.enum'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { AccessTokenService } from '../access-token/access-token.service'
import { AuthProviderResponseModel } from '../models/auth-provider.response.model'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { UserLocalService } from '../user/user-local.service'
import { SignInLocalUserRequestDto } from './dto/sign-in-local-user-request.dto'
import { SignInLocalUserResponseDto, SignInStatus } from './dto/sign-in-local-user-response.dto'
import { SignInProviderCodeDto } from './dto/sign-in-provider-code.dto'
import { SignInProviderDto } from './dto/sign-in-provider.dto'
import { DiscordOauth2ProviderService } from './oidc/discord/discord-oauth2-provider.service'
import { GoogleOauth2ProviderService } from './oidc/google/google-oauth2-provider.service'

@Controller({ path: 'accounts/sign-in', version: '1' })
@ApiTags('SignInV1')
export class SignInV1Controller {
  private readonly logger = new Logger(SignInV1Controller.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly userLocalService: UserLocalService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessTokenService: AccessTokenService,
    private readonly googleOauth2ProviderService: GoogleOauth2ProviderService,
    private readonly discordOauth2ProviderService: DiscordOauth2ProviderService,
  ) {}

  @Get('providers')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [AuthProviderResponseModel] })
  getProviders(@Req() { headers }: Pick<Request, 'headers'>): AuthProviderResponseModel[] {
    return [
      this.googleOauth2ProviderService.getProviderInfo(this.getBaseUrl(headers.host)),
      this.discordOauth2ProviderService.getProviderInfo(this.getBaseUrl(headers.host)),
    ]
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
    const profileId = user.profile! as Types.ObjectId
    await this.setAccessRefreshTokenCookiesByProfile(response, profileId, !persistent)
    this.logger.log(
      { message: 'Successful sign-in', username, persistent },
      SignInV1Controller.prototype.signInWithLocalUser.name,
    )
    return { status: SignInStatus.ok }
  }

  @Get(':provider/callback')
  @HttpCode(HttpStatus.FOUND)
  async redirectSignInWithProviderCallback(
    @Req() { headers, cookies }: Pick<Request, 'headers' | 'cookies'>,
    @Param() { provider }: SignInProviderDto,
    @Query() { code, baseUrl }: SignInProviderCodeDto,
    @Res({ passthrough: true }) res: Pick<Response, 'cookie' | 'redirect' | 'clearCookie'>,
  ) {
    baseUrl = baseUrl || this.getBaseUrl(headers.host)

    const providerService = {
      [OidcProvider.Google]: this.googleOauth2ProviderService,
      [OidcProvider.Discord]: this.discordOauth2ProviderService,
    }[provider]
    if (!providerService) throw new NotFoundException('Unknown provider')
    try {
      const profileIdOrRegistrationUrl = await providerService.profileIdBySignInWithCodeOrRegistrationUrl(code, baseUrl)
      if (typeof profileIdOrRegistrationUrl === 'string') {
        return res.redirect(HttpStatus.FOUND, profileIdOrRegistrationUrl)
      } else {
        await this.setAccessRefreshTokenCookiesByProfile(res, profileIdOrRegistrationUrl, true)
        return res.redirect(HttpStatus.FOUND, this.getContinuePath(cookies, res) ?? '/')
      }
    } catch (err) {
      this.logger.warn(err)
      res.redirect(HttpStatus.FOUND, '/sign-in/?error=' + encodeURIComponent(err.message))
    }
  }

  private getBaseUrl(host?: string) {
    return `${this.configService.get(Config.NUDCH_TOKEN_SECURE) ? 'https' : 'http'}://${host ?? 'nudchannel.com'}`
  }

  private getContinuePath(cookies: Record<string, any>, response: Pick<Response, 'clearCookie'>) {
    const key = 'continue_path'
    const continuePath = cookies[key]
    if (continuePath) {
      response.clearCookie(key)
    }
    return continuePath
  }

  private async setAccessRefreshTokenCookiesByProfile(
    response: Pick<Response, 'cookie'>,
    profileId: Types.ObjectId,
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
    this.logger.log({ message: 'Successful sign-in', profileId, isSession })
  }
}
