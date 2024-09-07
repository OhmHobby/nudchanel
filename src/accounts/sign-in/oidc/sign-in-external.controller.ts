import { Controller, Get, HttpCode, HttpStatus, Logger, Query, Res } from '@nestjs/common'
import { ApiFoundResponse, ApiOkResponse, ApiTags, ApiTemporaryRedirectResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { Cookies } from 'src/helpers/cookie.decorator'
import { SkipHttpLogging } from 'src/helpers/skip-http-logging.decorator'
import { SignInExternalRedirectDto } from '../dto/sign-in-external-redirect.dto'
import { SignInProviderCodeDto } from '../dto/sign-in-provider-code.dto'
import { DiscordOauth2ProviderService } from './discord-oauth2-provider.service'
import { GoogleOauth2ProviderService } from './google-oauth2-provider.service'

@Controller({ path: 'sign-in' })
@ApiTags('SignInExternal')
export class SignInExternalController {
  private readonly logger = new Logger(SignInExternalController.name)

  constructor(
    private readonly googleOauth2ProviderService: GoogleOauth2ProviderService,
    private readonly discordOauth2ProviderService: DiscordOauth2ProviderService,
  ) {}

  @Get(OidcProvider.Google)
  @ApiOkResponse()
  @ApiFoundResponse()
  redirectToGoogleSignIn(@Query() dto: SignInExternalRedirectDto, @Res() response: Response) {
    return this.googleOauth2ProviderService.redirectToProviderSignIn(dto.continue, dto.redirect, response)
  }

  @Get(OidcProvider.Discord)
  @ApiOkResponse()
  @ApiFoundResponse()
  redirectToDiscordSignIn(@Query() dto: SignInExternalRedirectDto, @Res() response: Response) {
    return this.discordOauth2ProviderService.redirectToProviderSignIn(dto.continue, dto.redirect, response)
  }

  @Get(OidcProvider.Google + '/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiTemporaryRedirectResponse()
  @SkipHttpLogging()
  async signInWithGoogle(
    @Query() { code }: SignInProviderCodeDto,
    @Res({ passthrough: true }) response: Response,
    @Cookies('continue') continueUrl?: string,
  ) {
    response.clearCookie('continue')
    return await this.googleOauth2ProviderService.signInWithCode(code, continueUrl)
  }

  @Get(OidcProvider.Discord + '/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiTemporaryRedirectResponse()
  @SkipHttpLogging()
  async signInWithDiscord(
    @Query() { code }: SignInProviderCodeDto,
    @Res({ passthrough: true }) response: Response,
    @Cookies('continue') continueUrl?: string,
  ) {
    response.clearCookie('continue')
    return await this.discordOauth2ProviderService.signInWithCode(code, continueUrl)
  }
}
