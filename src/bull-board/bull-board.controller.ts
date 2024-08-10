import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/dist/src/queueAdapters/bull'
import { ExpressAdapter } from '@bull-board/express'
import { InjectQueue } from '@nestjs/bull'
import { All, Controller, Next, Request, Response } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Queue } from 'bull'
import config from 'config'
import { NextFunction } from 'express'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'

@Controller(config.get<string>(Config.HTTP_BULLBOARD_PATH))
@ApiExcludeController()
export class BullBoardController {
  constructor(
    @InjectQueue(BullQueueName.DiscordEventsNotifier)
    private readonly discordEventsNotifierQueue: Queue,
    @InjectQueue(BullQueueName.Email)
    private readonly emailqueue: Queue,
  ) {}

  @All('*')
  @AuthGroups(config.get<string[]>(Config.HTTP_BULLBOARD_AUTH_GROUPS))
  bullboard(@Request() req: Request, @Response() res: Response, @Next() next: NextFunction) {
    const basePath = '/' + config.get<string>(Config.HTTP_BULLBOARD_PATH)
    const entryPointPath = basePath + '/'
    const serverAdapter = new ExpressAdapter()
    const router = serverAdapter.getRouter()
    serverAdapter.setBasePath(basePath)
    createBullBoard({
      queues: [new BullAdapter(this.discordEventsNotifierQueue), new BullAdapter(this.emailqueue)],
      serverAdapter,
    })
    router(Object.assign(req, { url: req.url.replace(entryPointPath, '/') }), res, next)
  }
}
