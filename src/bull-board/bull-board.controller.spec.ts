jest.mock('@bull-board/api/dist/src/queueAdapters/bullMQ')

import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { BullBoardController } from './bull-board.controller'

describe(BullBoardController.name, () => {
  let controller: BullBoardController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BullBoardController],
      providers: [
        { provide: getQueueToken(BullQueueName.Discord), useValue: { close: jest.fn() } },
        { provide: getQueueToken(BullQueueName.Email), useValue: { close: jest.fn() } },
        { provide: getQueueToken(BullQueueName.Migration), useValue: { close: jest.fn() } },
        { provide: getQueueToken(BullQueueName.Photo), useValue: { close: jest.fn() } },
        { provide: getQueueToken(BullQueueName.GalleryPhotoValidation), useValue: { close: jest.fn() } },
        { provide: getQueueToken(BullQueueName.GalleryPhotoConversion), useValue: { close: jest.fn() } },
      ],
    }).compile()

    controller = module.get(BullBoardController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return correct number of queues', () => {
    expect(controller.queues).toHaveLength(Object.values(BullQueueName).length)
  })
})
