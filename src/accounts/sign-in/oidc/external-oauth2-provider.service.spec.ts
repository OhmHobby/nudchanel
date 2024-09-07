import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { SignInService } from '../sign-in.service'
import { ExternalOauth2ProviderService } from './external-oauth2-provider.service'
import { OidcProvider } from 'src/enums/oidc-provider.enum'

jest.mock('../sign-in.service')
jest.mock('src/accounts/registration/registration.service')

class ClassUnderTest extends ExternalOauth2ProviderService<any, any> {
  constructor(signInService: SignInService, registrationService: RegistrationService) {
    super(OidcProvider.Discord, 'https://accounts.nudchannel.com', signInService, registrationService)
  }

  get providerUser(): any {
    throw new Error('Method not implemented.')
  }

  findProfileId(): Promise<Types.ObjectId | undefined> {
    throw new Error('Method not implemented.')
  }

  createRegistrationTokenFromProviderUser(): Promise<string> {
    throw new Error('Method not implemented.')
  }
}

describe(ExternalOauth2ProviderService.name, () => {
  let signInService: SignInService
  let registrationService: RegistrationService

  let cut: ClassUnderTest

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignInService, RegistrationService],
    }).compile()

    signInService = module.get(SignInService)
    registrationService = module.get(RegistrationService)
    cut = new ClassUnderTest(signInService, registrationService)
  })

  describe(ExternalOauth2ProviderService.prototype.getRedirectToAppSignInUrl.name, () => {
    it('should continue to default path correctly', () => {
      const result = cut.getRedirectToAppSignInUrl('signInCode')
      expect(result).toBe('https://accounts.nudchannel.com/api/v1/accounts/sign-in?code=signInCode&continue=%2F')
    })

    it('should continue to cross origin correctly', () => {
      const result = cut.getRedirectToAppSignInUrl('signInCode', 'https://admin.nudchannel.com/dashboard')
      expect(result).toBe('https://admin.nudchannel.com/api/v1/accounts/sign-in?code=signInCode&continue=%2Fdashboard')
    })
  })
})
