import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/dist/src/queueAdapters/bull'
import { ExpressAdapter } from '@bull-board/express'
import { InjectQueue } from '@nestjs/bull'
import { All, Controller, Next, Request, Response } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Queue } from 'bull'
import { NextFunction } from 'express'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

const PATH = 'bullboard'

@Controller(PATH)
@ApiExcludeController()
export class BullBoardController {
  constructor(
    @InjectQueue(BullQueueName.Saiko)
    private readonly saikoQueue: Queue,
  ) {}

  @All('*')
  @AuthGroups(['it'])
  bullboard(@Request() req: Request, @Response() res: Response, @Next() next: NextFunction) {
    const basePath = '/' + PATH
    const entryPointPath = basePath + '/'
    const serverAdapter = new ExpressAdapter()
    const router = serverAdapter.getRouter()
    serverAdapter.setBasePath(basePath)
    createBullBoard({
      queues: [new BullAdapter(this.saikoQueue)],
      serverAdapter,
    })
    router(Object.assign(req, { url: req.url.replace(entryPointPath, '/') }), res, next)
  }
}
