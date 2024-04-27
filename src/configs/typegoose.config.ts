import { TypegooseModuleAsyncOptions } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'

@Injectable()
export class TypegooseConfigBuilderService {
  static build(connectionName?: MongoConnection): TypegooseModuleAsyncOptions {
    return {
      connectionName,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow(Config.DATABASE_MONGODB_PREFIX + (connectionName ?? MongoConnection.Default)),
      }),
      inject: [ConfigService],
    }
  }
}
