import { Module } from '@nestjs/common'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'

@Module({
  imports: [AccountsWorkerModule],
  controllers: [MigrationController],
  providers: [MigrationProcessorService],
})
export class MigrationWorkerModule {}
