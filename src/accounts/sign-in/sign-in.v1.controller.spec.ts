import { HttpStatus, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import { OidcProvider } from 'src/enums/oidc-provider.enum'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { uuidv4 } from 'uuidv7'
import { AccessTokenService } from '../access-token/access-token.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { UserLocalService } from '../user/user-local.service'
import { SignInProviderCodeDto } from './dto/sign-in-provider-code.dto'
import { SignInProviderDto } from './dto/sign-in-provider.dto'
import { DiscordOauth2ProviderService } from './oidc/discord/discord-oauth2-provider.service'
import { GoogleOauth2ProviderService } from './oidc/google/google-oauth2-provider.service'
import { SignInV1Controller } from './sign-in.v1.controller'

jest.mock('../access-token/access-token.service')
jest.mock('../refresh-token/refresh-token.service')
jest.mock('../user/user-local.service')
jest.mock('./oidc/discord/discord-oauth2-provider.service')
jest.mock('./oidc/google/google-oauth2-provider.service')

describe(SignInV1Controller.name, () => {
  let controller: SignInV1Controller
  let accessTokenService: AccessTokenService
  let refreshTokenService: RefreshTokenService
  let discordOauth2ProviderService: DiscordOauth2ProviderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignInV1Controller],
      providers: [
        ConfigService,
        RefreshTokenService,
        AccessTokenService,
        UserLocalService,
        GoogleOauth2ProviderService,
        DiscordOauth2ProviderService,
      ],
    }).compile()

    controller = module.get(SignInV1Controller)
    accessTokenService = module.get(AccessTokenService)
    refreshTokenService = module.get(RefreshTokenService)
    discordOauth2ProviderService = module.get(DiscordOauth2ProviderService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe(SignInV1Controller.prototype.redirectSignInWithProviderCallback.name, () => {
    const profileId = new Types.ObjectId()
    let mockRequest
    let mockResponse

    beforeEach(() => {
      mockRequest = {
        headers: {},
        cookies: {},
      }
      mockResponse = {
        cookie: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
      }
      refreshTokenService.create = jest.fn().mockResolvedValue(new RefreshTokenModel({ _id: uuidv4() }))
    })

    it('should throw exception when provider not found', async () => {
      const promise = controller.redirectSignInWithProviderCallback(
        mockRequest,
        new SignInProviderDto(),
        new SignInProviderCodeDto(),
        mockResponse,
      )
      await expect(promise).rejects.toThrow(NotFoundException)
    })

    it('should redirect with error message correctly', async () => {
      discordOauth2ProviderService.profileIdBySignInWithCodeOrRegistrationUrl = jest.fn().mockImplementation(() => {
        throw new Error('Unknown error')
      })
      await controller.redirectSignInWithProviderCallback(
        mockRequest,
        new SignInProviderDto({ provider: OidcProvider.Discord }),
        new SignInProviderCodeDto(),
        mockResponse,
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, '/sign-in/?error=Unknown%20error')
      expect(accessTokenService.setHttpAccessTokenCookie).not.toHaveBeenCalled()
      expect(refreshTokenService.setHttpRefreshTokenCookie).not.toHaveBeenCalled()
    })

    it('should redirect to home when sign-in successfully', async () => {
      discordOauth2ProviderService.profileIdBySignInWithCodeOrRegistrationUrl = jest.fn().mockResolvedValue(profileId)
      await controller.redirectSignInWithProviderCallback(
        mockRequest,
        new SignInProviderDto({ provider: OidcProvider.Discord }),
        new SignInProviderCodeDto(),
        mockResponse,
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, '/')
      expect(accessTokenService.setHttpAccessTokenCookie).toHaveBeenCalled()
      expect(refreshTokenService.setHttpRefreshTokenCookie).toHaveBeenCalled()
      expect(mockResponse.clearCookie).not.toHaveBeenCalled()
    })

    it('should redirect to continue path when sign-in successfully', async () => {
      discordOauth2ProviderService.profileIdBySignInWithCodeOrRegistrationUrl = jest.fn().mockResolvedValue(profileId)
      await controller.redirectSignInWithProviderCallback(
        { ...mockRequest, cookies: { continue_path: '/test' } },
        new SignInProviderDto({ provider: OidcProvider.Discord }),
        new SignInProviderCodeDto(),
        mockResponse,
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, '/test')
      expect(accessTokenService.setHttpAccessTokenCookie).toHaveBeenCalled()
      expect(refreshTokenService.setHttpRefreshTokenCookie).toHaveBeenCalled()
      expect(mockResponse.clearCookie).toHaveBeenCalled()
    })

    it('should redirect to register page correctly', async () => {
      const returnUrl = '/register?code=registration-token'
      discordOauth2ProviderService.profileIdBySignInWithCodeOrRegistrationUrl = jest.fn().mockResolvedValue(returnUrl)
      await controller.redirectSignInWithProviderCallback(
        { ...mockRequest },
        new SignInProviderDto({ provider: OidcProvider.Discord }),
        new SignInProviderCodeDto(),
        mockResponse,
      )
      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, returnUrl)
      expect(accessTokenService.setHttpAccessTokenCookie).not.toHaveBeenCalled()
      expect(refreshTokenService.setHttpRefreshTokenCookie).not.toHaveBeenCalled()
    })
  })
})
