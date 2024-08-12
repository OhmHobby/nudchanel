import { Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor() {}
}
