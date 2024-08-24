import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { StorageService } from 'src/storage/storage.service'
import { AsyncProcessPhotoParams } from './processor/async-process-photo-params'
import { PhotoProcessorService } from './processor/photo-processor.service'

@Injectable()
@Processor(BullQueueName.Photo)
export class PhotoConsumerService {
  private readonly logger = new Logger(PhotoConsumerService.name)

  constructor(
    private readonly storageService: StorageService,
    private readonly photoProcessor: PhotoProcessorService,
  ) {}

  @Process(BullJobName.PhotoProcess)
  async process({ data }: Job<AsyncProcessPhotoParams>) {
    this.logger.log({ message: `Process photo`, ...data })
    const rawBuffer = await this.storageService.getBuffer(data.source)
    const processedBuffer = await this.photoProcessor.process(rawBuffer, data.params)
    await this.storageService.putFile(data.destination, processedBuffer)
  }
}
