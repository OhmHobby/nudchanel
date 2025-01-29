import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AccountsModule } from './accounts/accounts.module'
import { AmqpModule } from './amqp/amqp.module'
import { ApiKeyModule } from './api-key/api-key.module'
import { AppController } from './app.controller'
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
import { MongoConnection } from './enums/mongo-connection.enum'
import { GalleryModule } from './gallery/gallery.module'
import { GoogleModule } from './google/google.module'
import { HttpLoggingInterceptor } from './helpers/http-logging.interceptor'
import { LdapServerModule } from './ldap-server/ldap-server.module'
import { MongooseServerLifecyclesService } from './mongoose.server.life-cycles.service'
import { OTELLifecyclesService } from './otel.life-cycles.service'
import { TypeormLifecyclesService } from './typeorm.life-cycles.service'

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
    TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Audit)),
    WinstonModule.forRootAsync({ useClass: WinstonConfig }),
    AccountsModule,
    AmqpModule,
    ApiKeyModule,
    AuditLogModule,
    BullBoardModule,
    DeliveryModule,
    GalleryModule,
    GoogleModule,
    LdapServerModule,
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
