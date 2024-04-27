import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import { AccountsModule } from './accounts/accounts.module'
import { AppController } from './app.controller'
import { AuthGroupGuard } from './auth/auth-group.guard'
import { AuthMiddleware } from './auth/auth.middleware'
import { BullBoardModule } from './bull-board/bull-board.module'
import { BullConfig } from './configs/bull.config'
import { configuration } from './configs/configuration'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { TypegooseConfigBuilderService } from './configs/typegoose.config'
import { WinstonConfig } from './configs/winston.config'
import { DeliveryModule } from './delivery/delivery.module'
import { MongoConnection } from './enums/mongo-connection.enum'
import { GoogleModule } from './google/google.module'
import { SchedulerModule } from './scheduler/scheduler.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useClass: BullConfig,
      inject: [ConfigService],
    }),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build()),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Accounts)),
    WinstonModule.forRootAsync({
      useClass: WinstonConfig,
    }),
    AccountsModule,
    BullBoardModule,
    DeliveryModule,
    GoogleModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: AuthGroupGuard }, SwaggerConfigBuilder],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
