import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { AmqpService } from './amqp.service'

@Injectable()
export class AmqpLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(AmqpLifecyclesService.name)

  constructor(private readonly amqpService: AmqpService) {}

  async onApplicationShutdown(signal?: string) {
    try {
      this.logger.warn({ message: `Closing amqp connections`, signal })
      await Promise.all(
        this.amqpService.amqpConnectionManager
          .getConnections()
          .map((connection) => connection.managedConnection.close()),
      )
      this.logger.log(`Successfully closed amqp connections`)
    } catch (err) {
      this.logger.error('Error while closing amqp connections', err)
    }
  }
}
