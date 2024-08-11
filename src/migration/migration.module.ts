import { Module } from '@nestjs/common'
import { AccountsModule } from 'src/accounts/accounts.module'
import { MigrationProcessorService } from './migration-processor.service'

@Module({
  imports: [AccountsModule],
  providers: [MigrationProcessorService],
})
export class MigrationModule {}
