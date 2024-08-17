import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { SignInTokenModel } from 'src/models/accounts/signin-token.model'
import { SignInService } from './sign-in.service'

describe(SignInService.name, () => {
  let service: SignInService
  const signinTokenModel = getModelForClass(SignInTokenModel)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignInService, { provide: getModelToken(SignInTokenModel.name), useValue: signinTokenModel }],
    }).compile()

    service = module.get(SignInService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(SignInService.prototype.codeExpires.name, () => {
    it('should return date type', () => {
      expect(service.codeExpires()).toBeInstanceOf(Date)
    })
  })

  describe(SignInService.prototype.createCode.name, () => {
    it('should create correctly', async () => {
      signinTokenModel.create = jest.fn().mockImplementation((arg) => Promise.resolve(arg))
      const result = await service.createCode('profile-id')
      expect(typeof result).toBe('string')
    })
  })

  describe(SignInService.prototype.useCode.name, () => {
    it('should return profile id correctly', async () => {
      const profileId = new Types.ObjectId()
      signinTokenModel.findOneAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ profile: profileId }),
      })
      const result = await service.useCode('code')
      expect(result).toBe(profileId.toHexString())
    })

    it('should return null when code not found', async () => {
      signinTokenModel.findOneAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      const result = await service.useCode('code')
      expect(result).toBeNull()
    })
  })
})
