import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Repository } from 'typeorm'

@Injectable()
export class MigrationService implements OnModuleDestroy {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    @InjectRepository(DataMigrationEntity)
    private readonly dataMigrationRepository: Repository<DataMigrationEntity>,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
  ) {}

  async getDataMigrations() {
    const row = await this.dataMigrationRepository.find()
    return row.map((el) => el.id)
  }

  async triggerDataMigration(name: string) {
    return await this.migrationQueue.add(BullJobName.MigrateData, name)
  }

  async onModuleDestroy() {
    await this.migrationQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
