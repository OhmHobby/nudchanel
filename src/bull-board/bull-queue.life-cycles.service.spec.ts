import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullQueueLifecyclesService } from './bull-queue.life-cycles.service'

describe(BullQueueLifecyclesService.name, () => {
  let service: BullQueueLifecyclesService
  const mockCloseQueue = jest.fn().mockResolvedValue(null)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BullQueueLifecyclesService,
        { provide: getQueueToken(BullQueueName.Discord), useValue: { close: mockCloseQueue } },
        { provide: getQueueToken(BullQueueName.Email), useValue: { close: mockCloseQueue } },
        { provide: getQueueToken(BullQueueName.Migration), useValue: { close: mockCloseQueue } },
        { provide: getQueueToken(BullQueueName.Photo), useValue: { close: mockCloseQueue } },
      ],
    }).compile()

    service = module.get(BullQueueLifecyclesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should close all queue', async () => {
    await service.onApplicationShutdown()
    expect(mockCloseQueue).toHaveBeenCalledTimes(Object.values(BullQueueName).length)
  })
})
