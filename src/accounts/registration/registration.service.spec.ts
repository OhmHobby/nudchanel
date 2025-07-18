import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'
import { RegistrationService } from './registration.service'

jest.mock('../profile/profile-name.service')
jest.mock('../profile/profile.service')

describe('RegistrationService', () => {
  let service: RegistrationService
  const registrationTokenModel = getModelForClass(RegistrationTokenModel)
  let profileService: ProfileService
  let profileNameService: ProfileNameService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getModelToken('RegistrationTokenModel'), useValue: registrationTokenModel },
        ProfileService,
        ProfileNameService,
      ],
    }).compile()

    service = module.get<RegistrationService>(RegistrationService)
    profileService = module.get(ProfileService)
    profileNameService = module.get(ProfileNameService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('tokenExpires', () => {
    it('should return date type', () => {
      expect(service.tokenExpires()).toBeInstanceOf(Date)
    })
  })

  describe('find', () => {
    it('should call findOne correctly', async () => {
      registrationTokenModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.find('registration-token-id')
      expect(registrationTokenModel.findOne).toHaveBeenCalled()
    })
  })

  describe('createToken', () => {
    it('should findOneAndUpdate correctly', async () => {
      registrationTokenModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.createToken({})
      expect(registrationTokenModel.findOneAndUpdate).toHaveBeenCalled()
    })
  })

  describe('useToken', () => {
    it('should call findOneAndDelete', async () => {
      registrationTokenModel.findOneAndDelete = jest.fn().mockReturnValue({ exec: jest.fn() })
      await service.useToken('token')
      expect(registrationTokenModel.findOneAndDelete).toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('should create profile and profile name correctly', async () => {
      profileService.create = jest.fn().mockResolvedValue({ _id: 'profile-id' })
      await service.register({}, [new ProfileNameModel(), new ProfileNameModel()])
      expect(profileService.create).toHaveBeenCalled()
      expect(profileNameService.upsert).toHaveBeenCalledTimes(2)
    })
  })

  describe('redirectToAppRegistrationUrl', () => {
    const registrationToken = 'registration-token'

    it('should return default base url correctly', () => {
      const result = service.redirectToAppRegistrationUrl(registrationToken)
      expect(result).toBe('/register?code=registration-token')
    })
  })
})
