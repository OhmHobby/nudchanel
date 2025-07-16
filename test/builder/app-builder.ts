import { getConnectionToken, getModelToken } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { ClassSerializerInterceptor, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import { ThrottlerModule } from '@nestjs/throttler'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { getModelForClass } from '@typegoose/typegoose'
import { useContainer } from 'class-validator'
import cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AmqpModule } from 'src/amqp/amqp.module'
import { AppModule } from 'src/app.module'
import { BullConfig } from 'src/configs/bull.config'
import { SwaggerConfigBuilder } from 'src/configs/swagger.config'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { ApiKeyModel } from 'src/models/api-key.model'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { resetMockModel } from 'test/helpers/mock-model'
import { MockBullModule } from './mock-bull-module.ts'
import { MockCacheModule } from './mock-cache-module'
import { mockDiscordRestClient } from './mock-discord-rest-client'
import { MockOpenTelemetryModule } from './mock-opentelemetry-module'
import { MockRabbitMQModule } from './mock-rabbitmq-module'
import { MockThrottlerModule } from './mock-throttler-module'
import { mockTypegooseConnection } from './mock-typegoose-connection'

export class AppBuilder {
  private readonly moduleFixture: TestingModuleBuilder

  constructor() {
    this.moduleFixture = Test.createTestingModule({
      imports: [AppModule],
    })
  }

  withDefaultMockModules() {
    this.moduleFixture
      .overrideModule(CacheModule)
      .useModule(MockCacheModule)
      .overrideModule(ThrottlerModule)
      .useModule(MockThrottlerModule)
      .overrideModule(AmqpModule)
      .useModule(MockRabbitMQModule)
      .overrideModule(OpenTelemetryModule)
      .useModule(MockOpenTelemetryModule)
      .overrideModule(BullModule)
      .useModule(MockBullModule)
      .overrideProvider(ServiceProvider.DISCORD_REST)
      .useValue(() => mockDiscordRestClient)
      .overrideProvider(BullConfig)
      .useValue({ createSharedConfiguration: jest.fn() })
      .overrideProvider(getModelToken(ApiKeyModel.name))
      .useValue(resetMockModel(getModelForClass(ApiKeyModel)))
      .overrideProvider(getModelToken(GroupModel.name))
      .useValue(resetMockModel(getModelForClass(GroupModel)))
      .overrideProvider(getModelToken(MailSenderAddressModel.name))
      .useValue(resetMockModel(getModelForClass(MailSenderAddressModel)))
      .overrideProvider(getModelToken(MailTemplateModel.name))
      .useValue(resetMockModel(getModelForClass(MailTemplateModel)))
      .overrideProvider(getModelToken(ProfileModel.name))
      .useValue(resetMockModel(getModelForClass(ProfileModel)))
      .overrideProvider(getModelToken(ProfileNameModel.name))
      .useValue(resetMockModel(getModelForClass(ProfileNameModel)))
      .overrideProvider(getModelToken(RegistrationTokenModel.name))
      .useValue(resetMockModel(getModelForClass(RegistrationTokenModel)))
      .overrideProvider(getModelToken(TeamGroupModel.name))
      .useValue(resetMockModel(getModelForClass(TeamGroupModel)))
      .overrideProvider(getModelToken(TeamMemberModel.name))
      .useValue(resetMockModel(getModelForClass(TeamMemberModel)))
      .overrideProvider(getModelToken(TeamRoleModel.name))
      .useValue(resetMockModel(getModelForClass(TeamRoleModel)))
      .overrideProvider(getModelToken(UploadBatchFileModel.name))
      .useValue(resetMockModel(getModelForClass(UploadBatchFileModel)))
      .overrideProvider(getModelToken(UploadBatchJobModel.name))
      .useValue(resetMockModel(getModelForClass(UploadBatchJobModel)))
      .overrideProvider(getModelToken(UploadTaskModel.name))
      .useValue(resetMockModel(getModelForClass(UploadTaskModel)))
      .overrideProvider(getModelToken(UserGroupModel.name))
      .useValue(resetMockModel(getModelForClass(UserGroupModel)))
      .overrideProvider(getRepositoryToken(UserLocalUserEntity))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        createQueryBuilder: jest.fn(),
      })
      .overrideProvider(getConnectionToken())
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Accounts))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Photo))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Mailer))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getDataSourceToken())
      .useValue({ getRepository: jest.fn() })

    for (const entity of TypeormConfigService.entities) {
      this.moduleFixture
        .overrideProvider(getRepositoryToken(entity))
        .useValue({ save: jest.fn().mockImplementation((e) => Promise.resolve(e)) })
    }

    return this
  }

  async build(): Promise<INestApplication> {
    const moduleFixture = await this.moduleFixture.compile()
    const app = moduleFixture.createNestApplication({ forceCloseConnections: true })
    app.use(cookieParser())
    app.enableVersioning({ prefix: 'api/v', type: VersioningType.URI })
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    useContainer(app.select(AppModule), { fallbackOnErrors: true })
    await app.get(SwaggerConfigBuilder).build(app)
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()
    return app
  }
}
