import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AccountsWorkerModule } from './accounts/accounts.worker.module'
import { AmqpModule } from './amqp/amqp.module'
import { AppController } from './app.controller'
import { AuthGroupGuard } from './auth/auth-group.guard'
import { AuthMiddleware } from './auth/auth.middleware'
import { BullBoardModule } from './bull-board/bull-board.module'
import { BullConfig } from './configs/bull.config'
import { CacheConfig } from './configs/cache.config'
import { clsConfigFactory } from './configs/cls.config'
import { configuration } from './configs/configuration'
import { OpenTelemetryConfigService } from './configs/open-telemetry.config'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { TypegooseConfigBuilderService } from './configs/typegoose.config'
import { WinstonConfig } from './configs/winston.config'
import { DeliveryWorkerModule } from './delivery/delivery.worker.module'
import { MongoConnection } from './enums/mongo-connection.enum'
import { HttpLoggingInterceptor } from './helpers/http-logging.interceptor'
import { MigrationWorkerModule } from './migration/migration.worker.module'
import { MongooseWorkerLifecyclesService } from './mongoose.worker.life-cycles.service copy'
import { OTELLifecyclesService } from './otel.life-cycles.service'
import { SchedulerModule } from './scheduler/scheduler.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
    BullModule.forRootAsync({ imports: [ConfigModule], useClass: BullConfig, inject: [ConfigService] }),
    CacheModule.registerAsync({ isGlobal: true, useClass: CacheConfig }),
    OpenTelemetryModule.forRootAsync({ useClass: OpenTelemetryConfigService }),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build()),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Accounts)),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Mailer)),
    WinstonModule.forRootAsync({ useClass: WinstonConfig }),
    AmqpModule,
    BullBoardModule,
    AccountsWorkerModule,
    DeliveryWorkerModule,
    MigrationWorkerModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGroupGuard },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    AuthMiddleware,
    MongooseWorkerLifecyclesService,
    SwaggerConfigBuilder,
    OTELLifecyclesService,
  ],
})
export class WorkerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
