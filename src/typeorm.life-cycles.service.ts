import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class TypeormLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger()

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onApplicationShutdown(signal: string) {
    if (this.dataSource.isInitialized) {
      this.logger.log({ message: 'Closing database connection', signal })
      return this.dataSource.destroy()
    }
  }
}
