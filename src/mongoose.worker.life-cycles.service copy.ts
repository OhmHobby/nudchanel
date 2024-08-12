import { getConnectionToken } from '@m8a/nestjs-typegoose'
import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Connection } from 'mongoose'
import { MongoConnection } from './enums/mongo-connection.enum'

@Injectable()
export class MongooseWorkerLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(MongooseWorkerLifecyclesService.name)

  constructor(
    @Inject(getConnectionToken())
    private readonly connection: Connection,
    @Inject(getConnectionToken(MongoConnection.Accounts))
    private readonly accountsConnection: Connection,
    @Inject(getConnectionToken(MongoConnection.Mailer))
    private readonly mailerConnection: Connection,
  ) {}

  async onApplicationShutdown(signal?: string) {
    try {
      this.logger.warn({ message: 'Closing mongoose connections', signal })
      await Promise.all([this.connection.close(), this.accountsConnection.close(), this.mailerConnection.close()])
      this.logger.log('Successfully closed mongoose connections')
    } catch (err) {
      this.logger.error('Error while closing mongoose connections', err)
    }
  }
}
