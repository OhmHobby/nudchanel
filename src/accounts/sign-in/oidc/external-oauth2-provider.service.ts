import { HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { Types } from 'mongoose'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { SignInService } from '../sign-in.service'
import { ExternalOidcUser } from './external-oidc-user'

export abstract class ExternalOauth2ProviderService<T extends ExternalOidcUser<U>, U = any> {
  constructor(
    private readonly providerName: OidcProvider,
    private readonly baseUrl: string,
    protected readonly signInService: SignInService,
    protected readonly registrationService: RegistrationService,
  ) {}

  redirectToProviderSignIn(
    continueUrl: string,
    redirect: boolean,
    response: Pick<Response, 'redirect' | 'send' | 'cookie'>,
  ) {
    const signInUrl = this.providerUser.generateSignInUrl()
    this.saveContinuePath(continueUrl, response)
    if (redirect) response.redirect(HttpStatus.FOUND, signInUrl)
    else response.send(signInUrl)
  }

  getRedirectToAppSignInUrl(signInCode: string, continueTo?: string): string {
    const continueToUrl = new URL(continueTo ?? this.baseUrl)
    const appBaseUrl = continueToUrl.origin

    const redirectUrl = new URL('/api/v1/accounts/sign-in', appBaseUrl)
    redirectUrl.searchParams.set('code', signInCode)
    redirectUrl.searchParams.set('continue', continueToUrl.pathname)

    return redirectUrl.href
  }

  async signInWithCode(code: string, continueTo?: string): Promise<string> {
    const providerUser = await this.providerUser.getProviderUser(code)
    const profileId = await this.findProfileId(providerUser)
    if (profileId) {
      const signInCode = await this.signInService.createCode(profileId)
      const redirectUrl = this.getRedirectToAppSignInUrl(signInCode, continueTo)
      return redirectUrl
    } else {
      const registrationToken = await this.createRegistrationTokenFromProviderUser(providerUser)
      const redirectUrl = this.registrationService.redirectToAppRegistrationUrl(registrationToken, continueTo)
      return redirectUrl
    }
  }

  abstract get providerUser(): T

  abstract findProfileId(user: U): Promise<Types.ObjectId | undefined>

  private saveContinuePath(continueUrl: string, response: Pick<Response, 'cookie'>) {
    response.cookie('continue', continueUrl)
    return continueUrl
  }

  protected getCallbackUri(baseUrl: string): string {
    const url = new URL(`/sign-in/${this.providerName}/callback`, baseUrl)
    return url.href
  }

  abstract createRegistrationTokenFromProviderUser(user: U): Promise<string>
}
