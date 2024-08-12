import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { AmqpService } from 'src/amqp/amqp.service'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'
import { DiscordProcessorService } from './discord-processor.service'

jest.mock('src/amqp/amqp.service')
jest.mock('../profile/profile-name.service')
jest.mock('../profile/profile.service')

describe(DiscordProcessorService.name, () => {
  let service: DiscordProcessorService
  let profileService: ProfileService
  let profileNameService: ProfileNameService
  let amqpService: AmqpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordProcessorService,
        ProfileService,
        ProfileNameService,
        AmqpService,
        { provide: getQueueToken(BullQueueName.Migration), useValue: jest.fn() },
      ],
    }).compile()

    service = module.get(DiscordProcessorService)
    profileService = module.get(ProfileService)
    profileNameService = module.get(ProfileNameService)
    amqpService = module.get(AmqpService)
    amqpService.publish = jest.fn()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(DiscordProcessorService.prototype.triggerProfileSync.name, () => {
    it('should not trigger when no profile found', async () => {
      profileService.findByDiscordId = jest.fn().mockResolvedValue(null)
      await service.triggerProfileSync('discord-id')
      expect(amqpService.publish).not.toHaveBeenCalled()
    })

    it('should trigger when profile has 2 discord ids', async () => {
      const profile = new ProfileModel()
      profile.discord_ids = ['1', '2']
      profileService.findByDiscordId = jest.fn().mockResolvedValue(profile)
      profileNameService.getNickNameWithInitials = jest.fn().mockResolvedValue('nickname')
      profileNameService.getNickNameWithFirstNameAndInitial = jest.fn().mockResolvedValue('nickname')
      profileNameService.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix = jest.fn().mockResolvedValue('nickname')
      await service.triggerProfileSync('discord-id')
      expect(amqpService.publish).toHaveBeenCalledTimes(2)
    })
  })

  describe(DiscordProcessorService.prototype.getNicknameWithSuffix.name, () => {
    it('should return suffix when index more than 0', () => {
      const result = service.getNicknameWithSuffix('Nickname', 1)
      expect(result).toBe('Nickname 2')
    })

    it('should not return suffix when index is 0', () => {
      const result = service.getNicknameWithSuffix('Nickname')
      expect(result).toBe('Nickname')
    })
  })
})
