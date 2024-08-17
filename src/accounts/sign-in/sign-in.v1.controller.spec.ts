import { Test, TestingModule } from '@nestjs/testing'
import { uuidv4 } from 'uuidv7'
import { AccessTokenService } from '../access-token/access-token.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { UserLocalService } from '../user/user-local.service'
import { SignInCodeDto } from './dto/sign-in-code.dto'
import { SignInService } from './sign-in.service'
import { SignInV1Controller } from './sign-in.v1.controller'

jest.mock('../access-token/access-token.service')
jest.mock('../refresh-token/refresh-token.service')
jest.mock('../user/user-local.service')
jest.mock('./sign-in.service')

describe(SignInV1Controller.name, () => {
  let controller: SignInV1Controller
  let signInService: SignInService
  let accessTokenService: AccessTokenService
  let refreshTokenService: RefreshTokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignInV1Controller],
      providers: [SignInService, RefreshTokenService, AccessTokenService, UserLocalService],
    }).compile()

    controller = module.get(SignInV1Controller)
    signInService = module.get(SignInService)
    accessTokenService = module.get(AccessTokenService)
    refreshTokenService = module.get(RefreshTokenService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe(SignInV1Controller.prototype.signInWithCode.name, () => {
    let mockResponse

    beforeEach(() => {
      mockResponse = {
        cookie: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
      }
    })

    it('should throw when invalid code', async () => {
      signInService.useCode = jest.fn().mockResolvedValue(null)
      const request = controller.signInWithCode(mockResponse, new SignInCodeDto({ code: uuidv4() }))
      await expect(request).rejects.toThrow()
      expect(signInService.useCode).toHaveBeenCalled()
    })

    it('should set tokens and redirect when success', async () => {
      signInService.useCode = jest.fn().mockResolvedValue('profile-id')
      await controller.signInWithCode(mockResponse, new SignInCodeDto({ code: uuidv4() }))
      expect(accessTokenService.setHttpAccessTokenCookie).toHaveBeenCalled()
      expect(refreshTokenService.setHttpRefreshTokenCookie).toHaveBeenCalled()
      expect(mockResponse.redirect).toHaveBeenCalled()
    })
  })
})
