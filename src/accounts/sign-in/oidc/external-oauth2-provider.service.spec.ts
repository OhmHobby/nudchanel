import { Test, TestingModule } from '@nestjs/testing'
import { APIUser } from 'discord.js'
import { Types } from 'mongoose'
import { AuthProviderResponseModel } from 'src/accounts/models/auth-provider.response.model'
import { RegistrationService } from 'src/accounts/registration/registration.service'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { ProfileId } from 'src/models/types'
import { ExternalOauth2ProviderService } from './external-oauth2-provider.service'

jest.mock('src/accounts/registration/registration.service')

class ClassUnderTest extends ExternalOauth2ProviderService<APIUser> {
  protected providerName: OidcProvider

  constructor(registrationService: RegistrationService) {
    super(registrationService)
  }

  getProviderInfo(): AuthProviderResponseModel {
    return new AuthProviderResponseModel()
  }

  getProviderUser(): Promise<APIUser> {
    return Promise.resolve(<APIUser>{})
  }

  findProfileId(): Promise<ProfileId | undefined> {
    return Promise.resolve(undefined)
  }

  createRegistrationTokenFromProviderUser(): Promise<string> {
    return Promise.resolve('')
  }
}

describe(ExternalOauth2ProviderService.name, () => {
  let registrationService: RegistrationService

  let cut: ClassUnderTest

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationService],
    }).compile()

    registrationService = module.get(RegistrationService)
    cut = new ClassUnderTest(registrationService)
  })

  describe(ExternalOauth2ProviderService.prototype.profileIdBySignInWithCodeOrRegistrationUrl.name, () => {
    it('should continue to default path correctly', async () => {
      const profileId = new Types.ObjectId()
      cut.findProfileId = jest.fn().mockResolvedValue(profileId)
      const result = await cut.profileIdBySignInWithCodeOrRegistrationUrl('signInCode', 'http://dev.nudchannel.com')
      expect(result).toEqual(profileId)
    })

    it('should continue to cross origin correctly', async () => {
      const registrationUrl = 'http://dev.nudchannel.com/register?code=0'
      registrationService.redirectToAppRegistrationUrl = jest.fn().mockReturnValue(registrationUrl)
      const result = await cut.profileIdBySignInWithCodeOrRegistrationUrl('signInCode', 'http://dev.nudchannel.com')
      expect(result).toBe(registrationUrl)
    })
  })
})
