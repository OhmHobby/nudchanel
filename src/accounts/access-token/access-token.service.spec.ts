import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { SignAccessToken } from '@nudchannel/auth'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'
import { UserGroupService } from '../user/user-group.service'
import { AccessTokenService } from './access-token.service'

jest.mock('@nudchannel/auth')
jest.mock('../profile/profile-name.service')
jest.mock('../profile/profile.service')
jest.mock('../user/user-group.service')

describe(AccessTokenService.name, () => {
  let service: AccessTokenService
  let profileService: ProfileService
  let profileNameService: ProfileNameService
  let userGroupService: UserGroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessTokenService, ProfileService, ProfileNameService, UserGroupService, ConfigService],
    }).compile()

    service = module.get<AccessTokenService>(AccessTokenService)
    profileService = module.get(ProfileService)
    profileNameService = module.get(ProfileNameService)
    userGroupService = module.get(UserGroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('accessTokenExpires', () => {
    it('should return date type', () => {
      expect(service.accessTokenExpires()).toBeInstanceOf(Date)
    })
  })

  describe('generateAccessToken', () => {
    it('should return access token', async () => {
      const accessToken = 'access-token'
      profileService.findById = jest.fn().mockResolvedValue({ photo: '' })
      profileNameService.getProfileName = jest.fn().mockResolvedValue(new ProfileNameModel())
      userGroupService.getProfileGroups = jest.fn().mockResolvedValue([])
      SignAccessToken.prototype.setProfileId = jest.fn().mockReturnValue({
        setGroups: jest.fn().mockReturnThis(),
        setName: jest.fn().mockReturnThis(),
        setPhoto: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(accessToken),
      })

      const result = await service.generateAccessToken('profile-id')
      expect(result).toBe(accessToken)
    })
  })

  describe('setHttpAccessTokenCookie', () => {
    it('should set cookie correctly', () => {
      const response = { cookie: jest.fn() }
      service.setHttpAccessTokenCookie(response, 'access-token')
      expect(response.cookie).toHaveBeenCalled()
    })
  })
})
