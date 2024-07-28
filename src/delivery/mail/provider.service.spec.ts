import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MailSenderAddressService } from './address.service'
import { MailProviderService } from './provider.service'

jest.mock('@nestjs/config')
jest.mock('@sendgrid/mail')
jest.mock('./address.service')

describe(MailProviderService.name, () => {
  let service: MailProviderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailProviderService, ConfigService, MailSenderAddressService],
    }).compile()

    service = module.get<MailProviderService>(MailProviderService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('replaceNoReply', () => {
    it('should replace correctly', () => {
      const noreplyEmail = 'noreply@nudchannel.com'
      expect(service.replaceNoReply('test@nudchannel.com', noreplyEmail)).toBe(noreplyEmail)
      expect(service.replaceNoReply('test.test@nudchannel.com', noreplyEmail)).toBe(noreplyEmail)
      expect(service.replaceNoReply('test_test@nudchannel.com', noreplyEmail)).toBe(noreplyEmail)
      expect(service.replaceNoReply('test3@nudchannel.com', noreplyEmail)).toBe(noreplyEmail)
      expect(service.replaceNoReply('"test" <test@nudchannel.com>', noreplyEmail)).toBe(`"test" <${noreplyEmail}>`)
    })
  })
})
