import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { ApplicationSettingService } from './application-setting.service'

describe(ApplicationSettingService.name, () => {
  const encryptionKey = '0000000000000000000000000000000000000000000000000000000000000000'

  let service: ApplicationSettingService
  const repository = {
    findOneBy: jest.fn(),
    upsert: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSettingService,
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue(encryptionKey) } },
        { provide: getRepositoryToken(ApplicationSettingEntity), useValue: repository },
      ],
    }).compile()

    service = module.get<ApplicationSettingService>(ApplicationSettingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get set', () => {
    let encrypted = ''
    const decrypted = '{"access_token":"eyJ..."}'

    it('should throw when get key not found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(null)
      await expect(service.getGoogleCredential()).rejects.toThrow()
    })

    it('should encrypt correctly', async () => {
      repository.upsert = jest.fn().mockImplementation((entity: ApplicationSettingEntity) => {
        encrypted = entity.value
      })
      await service.setGoogleCredential(decrypted)
      expect(repository.upsert).toHaveBeenCalledWith(expect.objectContaining({ value: encrypted }), expect.anything())
    })

    it('should decrypt correctly', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(new ApplicationSettingEntity({ value: encrypted }))
      await expect(service.getGoogleCredential()).resolves.toBe(decrypted)
    })
  })
})
