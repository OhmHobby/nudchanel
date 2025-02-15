import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Repository } from 'typeorm'

@Injectable()
export class MigrationService implements OnModuleDestroy {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    @InjectRepository(DataMigrationEntity)
    private readonly dataMigrationRepository: Repository<DataMigrationEntity>,
    @InjectQueue(BullQueueName.DataMigration)
    private readonly dataMigrationQueue: Queue,
  ) {}

  async getDataMigrations() {
    const row = await this.dataMigrationRepository.find()
    return row.map((el) => el.id)
  }

  async triggerDataMigration(name: string) {
    return await this.dataMigrationQueue.add(name, {})
  }

  async onModuleDestroy() {
    await this.dataMigrationQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
