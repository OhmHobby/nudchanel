import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import config from 'config'
import { WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AccountsModule } from './accounts/accounts.module'
import { AccountsWorkerModule } from './accounts/accounts.worker.module'
import { AmqpModule } from './amqp/amqp.module'
import { ApiKeyModule } from './api-key/api-key.module'
import { AppController } from './app.controller'
import { ApplicationSettingModule } from './application-setting/application-setting.module'
import { AuditLogModule } from './audit-log/audit-log.module'
import { AuditLogger } from './audit-log/audit-logger.interceptor'
import { AuthGroupGuard } from './auth/auth-group.guard'
import { AuthMiddleware } from './auth/auth.middleware'
import { BaseV1Controller } from './base.v1.controller'
import { BullBoardModule } from './bull-board/bull-board.module'
import { CacheLifeCyclesService } from './cache-life-cycles.service'
import { BullConfig } from './configs/bull.config'
import { CacheConfig } from './configs/cache.config'
import { clsConfigFactory } from './configs/cls.config'
import { configuration } from './configs/configuration'
import { OpenTelemetryConfigService } from './configs/open-telemetry.config'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { TypegooseConfigBuilderService } from './configs/typegoose.config'
import { TypeormConfigService } from './configs/typeorm.config'
import { WinstonConfig } from './configs/winston.config'
import { DeliveryModule } from './delivery/delivery.module'
import { DeliveryWorkerModule } from './delivery/delivery.worker.module'
import { DiscordWorkerModule } from './discord/discord-worker.module'
import { AppRunMode } from './enums/app-run-mode.enum'
import { Config } from './enums/config.enum'
import { MongoConnection } from './enums/mongo-connection.enum'
import { GalleryModule } from './gallery/gallery.module'
import { GoogleModule } from './google/google.module'
import { HttpLoggingInterceptor } from './helpers/http-logging.interceptor'
import { LdapServerModule } from './ldap-server/ldap-server.module'
import { MigrationWorkerModule } from './migration/migration.worker.module'
import { MongooseServerLifecyclesService } from './mongoose.server.life-cycles.service'
import { OTELLifecyclesService } from './otel.life-cycles.service'
import { PhotoWorkerModule } from './photo/photo.worker.module'
import { SchedulerModule } from './scheduler/scheduler.module'
import { StorageModule } from './storage/storage.module'
import { TypeormLifecyclesService } from './typeorm.life-cycles.service'

const runMode = config.get<AppRunMode>(Config.RUN_MODE)
const isRegisterWebServer = () => [AppRunMode.AllInOne, AppRunMode.Server].includes(runMode)
const isRegisterWorker = () => [AppRunMode.AllInOne, AppRunMode.Worker].includes(runMode)
const isRegisterLdapServer = () => config.get<boolean>(Config.LDAP_ENABLED)

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
    BullModule.forRootAsync({ imports: [ConfigModule], useClass: BullConfig, inject: [ConfigService] }),
    CacheModule.registerAsync({ isGlobal: true, useClass: CacheConfig }),
    OpenTelemetryModule.forRootAsync({ useClass: OpenTelemetryConfigService }),
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build()),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Accounts)),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Photo)),
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Mailer)),
    WinstonModule.forRootAsync({ useClass: WinstonConfig }),
    ApplicationSettingModule,
    AmqpModule,
    BullBoardModule,
    StorageModule,
    ConditionalModule.registerWhen(AccountsModule, isRegisterWebServer),
    ConditionalModule.registerWhen(GalleryModule, isRegisterWebServer),
    ConditionalModule.registerWhen(ApiKeyModule, isRegisterWebServer),
    ConditionalModule.registerWhen(AuditLogModule, isRegisterWebServer),
    ConditionalModule.registerWhen(DeliveryModule, isRegisterWebServer),
    ConditionalModule.registerWhen(GoogleModule, isRegisterWebServer),
    ConditionalModule.registerWhen(LdapServerModule, isRegisterLdapServer),
    ConditionalModule.registerWhen(AccountsWorkerModule, isRegisterWorker),
    ConditionalModule.registerWhen(PhotoWorkerModule, isRegisterWorker),
    ConditionalModule.registerWhen(DeliveryWorkerModule, isRegisterWorker),
    ConditionalModule.registerWhen(MigrationWorkerModule, isRegisterWorker),
    ConditionalModule.registerWhen(SchedulerModule, isRegisterWorker),
    ConditionalModule.registerWhen(DiscordWorkerModule, isRegisterWorker),
  ],
  controllers: [AppController, BaseV1Controller],
  providers: [
    { provide: APP_GUARD, useClass: AuthGroupGuard },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogger },
    AuthMiddleware,
    SwaggerConfigBuilder,
    CacheLifeCyclesService,
    TypeormLifecyclesService,
    MongooseServerLifecyclesService,
    OTELLifecyclesService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
