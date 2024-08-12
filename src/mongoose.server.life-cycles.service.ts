import { getConnectionToken } from '@m8a/nestjs-typegoose'
import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Connection } from 'mongoose'
import { MongoConnection } from './enums/mongo-connection.enum'

@Injectable()
export class MongooseServerLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(MongooseServerLifecyclesService.name)

  constructor(
    @Inject(getConnectionToken())
    private readonly connection: Connection,
    @Inject(getConnectionToken(MongoConnection.Accounts))
    private readonly accountsConnection: Connection,
    @Inject(getConnectionToken(MongoConnection.Gallery))
    private readonly galleryConnection: Connection,
    @Inject(getConnectionToken(MongoConnection.Photo))
    private readonly photoConnection: Connection,
    @Inject(getConnectionToken(MongoConnection.Mailer))
    private readonly mailerConnection: Connection,
    @Inject(getConnectionToken(MongoConnection.Audit))
    private readonly auditConnection: Connection,
  ) {}

  async onApplicationShutdown(signal?: string) {
    try {
      this.logger.warn({ message: 'Closing mongoose connections', signal })
      await Promise.all([
        this.connection.close(),
        this.accountsConnection.close(),
        this.galleryConnection.close(),
        this.photoConnection.close(),
        this.mailerConnection.close(),
        this.auditConnection.close(),
      ])
      this.logger.log('Successfully closed mongoose connections')
    } catch (err) {
      this.logger.error('Error while closing mongoose connections', err)
    }
  }
}
