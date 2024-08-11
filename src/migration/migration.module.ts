import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { MigrationProcessorService } from './migration-processor.service'
import { MigrationController } from './migration.controller.service'

@Module({
  imports: [AccountsModule],
  controllers: [MigrationController],
  providers: [MigrationProcessorService],
})
export class MigrationModule {}
