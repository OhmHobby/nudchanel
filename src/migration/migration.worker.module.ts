import { Module } from '@nestjs/common'
import { AccountsWorkerModule } from 'src/accounts/accounts.worker.module'
import { MigrationController } from './migration.controller.service'

@Module({
  imports: [AccountsWorkerModule],
  controllers: [MigrationController],
  providers: [],
})
export class MigrationWorkerModule {}
