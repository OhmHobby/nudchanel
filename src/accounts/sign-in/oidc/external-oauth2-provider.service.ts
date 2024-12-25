import { AuthProviderResponseModel } from 'src/accounts/models/auth-provider.response.model'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ProfileId } from 'src/models/types'

export abstract class ExternalOauth2ProviderService<T> {
  protected abstract readonly providerName: OidcProvider

  constructor(protected readonly registrationService: RegistrationService) {}

  async profileIdBySignInWithCodeOrRegistrationUrl(code: string, baseUrl: string): Promise<string | ProfileId> {
    const providerUser = await this.getProviderUser(code, this.redirectUri(baseUrl))
    const profileId = await this.findProfileId(providerUser)
    if (profileId) {
      return profileId
    } else {
      const registrationToken = await this.createRegistrationTokenFromProviderUser(providerUser)
      const redirectUrl = this.registrationService.redirectToAppRegistrationUrl(registrationToken)
      return redirectUrl
    }
  }

  redirectUri(baseUrl: string) {
    return new URL(`/api/v1/accounts/sign-in/${this.providerName}/callback`, baseUrl).href
  }

  abstract getProviderInfo(baseUrl: string): AuthProviderResponseModel

  abstract getProviderUser(code: string, redirectUri: string): Promise<T>

  abstract findProfileId(user: T): Promise<ProfileId | undefined>

  abstract createRegistrationTokenFromProviderUser(user: T): Promise<string>
}
