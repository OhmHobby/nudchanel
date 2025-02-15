import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ'
import { ExpressAdapter } from '@bull-board/express'
import { InjectQueue } from '@nestjs/bullmq'
import { All, Controller, Logger, Next, OnModuleDestroy, Request, Response } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Queue } from 'bullmq'
import config from 'config'
import { NextFunction } from 'express'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'
import { SkipHttpLogging } from 'src/helpers/skip-http-logging.decorator'

@Controller(config.get<string>(Config.HTTP_BULLBOARD_PATH))
@ApiExcludeController()
export class BullBoardController implements OnModuleDestroy {
  private readonly logger = new Logger(BullBoardController.name)

  constructor(
    @InjectQueue(BullQueueName.Email)
    private readonly emailQueue: Queue,
    @InjectQueue(BullQueueName.Discord)
    private readonly discordQueue: Queue,
    @InjectQueue(BullQueueName.DataMigration)
    private readonly migrationQueue: Queue,
    @InjectQueue(BullQueueName.Photo)
    private readonly photoQueue: Queue,
    @InjectQueue(BullQueueName.GalleryPhotoValidation)
    private readonly galleryPhotoValidationQueue: Queue,
    @InjectQueue(BullQueueName.GalleryPhotoConversion)
    private readonly galleryPhotoConversionQueue: Queue,
  ) {}

  @All('*')
  @AuthGroups(...config.get<string[]>(Config.HTTP_BULLBOARD_AUTH_GROUPS))
  @SkipHttpLogging()
  bullboard(@Request() req: Request, @Response() res: Response, @Next() next: NextFunction) {
    const basePath = '/' + config.get<string>(Config.HTTP_BULLBOARD_PATH)
    const entryPointPath = basePath + '/'
    const serverAdapter = new ExpressAdapter()
    const router = serverAdapter.getRouter()
    serverAdapter.setBasePath(basePath)
    createBullBoard({
      queues: this.queues,
      serverAdapter,
    })
    router(Object.assign(req, { url: req.url.replace(entryPointPath, '/') }), res, next)
  }

  get queues() {
    return [
      new BullMQAdapter(this.emailQueue),
      new BullMQAdapter(this.discordQueue),
      new BullMQAdapter(this.migrationQueue),
      new BullMQAdapter(this.photoQueue),
      new BullMQAdapter(this.galleryPhotoValidationQueue),
      new BullMQAdapter(this.galleryPhotoConversionQueue),
    ]
  }

  async onModuleDestroy() {
    await Promise.all([
      this.emailQueue.close(),
      this.discordQueue.close(),
      this.migrationQueue.close(),
      this.photoQueue.close(),
      this.galleryPhotoValidationQueue.close(),
      this.galleryPhotoConversionQueue.close(),
    ])
    this.logger.log('Successfully closed bull queues')
  }
}
