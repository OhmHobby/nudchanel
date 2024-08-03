import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { uuidv4 } from 'uuidv7'
import { AccountsModule } from './accounts/accounts.module'
import { AmqpModule } from './amqp/amqp.module'
import { AppController } from './app.controller'
import { AuthGroupGuard } from './auth/auth-group.guard'
import { AuthMiddleware } from './auth/auth.middleware'
import { BullBoardModule } from './bull-board/bull-board.module'
import { BullConfig } from './configs/bull.config'
import { CacheConfig } from './configs/cache.config'
import { configuration } from './configs/configuration'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { TypegooseConfigBuilderService } from './configs/typegoose.config'
import { WinstonConfig } from './configs/winston.config'
import { DeliveryModule } from './delivery/delivery.module'
import { MongoConnection } from './enums/mongo-connection.enum'
import { GalleryModule } from './gallery/gallery.module'
import { GoogleModule } from './google/google.module'
import { HttpLoggingInterceptor } from './helpers/http-logging.interceptor'
import { SchedulerModule } from './scheduler/scheduler.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true, generateId: true, idGenerator: uuidv4 },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useClass: BullConfig,
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfig,
    }),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build()),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Accounts)),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Gallery)),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Mailer)),
    WinstonModule.forRootAsync({
      useClass: WinstonConfig,
    }),
    AmqpModule,
    AccountsModule,
    BullBoardModule,
    DeliveryModule,
    GoogleModule,
    SchedulerModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGroupGuard },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    SwaggerConfigBuilder,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
