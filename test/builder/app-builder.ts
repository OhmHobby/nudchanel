import { getConnectionToken, getModelToken } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { ClassSerializerInterceptor, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import { getDataSourceToken } from '@nestjs/typeorm'
import { getModelForClass } from '@typegoose/typegoose'
import { useContainer } from 'class-validator'
import cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AmqpModule } from 'src/amqp/amqp.module'
import { AppModule } from 'src/app.module'
import { SwaggerConfigBuilder } from 'src/configs/swagger.config'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { ApiKeyModel } from 'src/models/api-key.model'
import { AuditLogModel } from 'src/models/audit/audit-log.model'
import { MailSenderAddressModel } from 'src/models/delivery/mail-sender.model'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { GoogleCredentialModel } from 'src/models/google-credential.model'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { resetMockModel } from 'test/helpers/mock-model'
import { MockBullModule } from './mock-bull-module.ts'
import { mockDiscordRestClient } from './mock-discord-rest-client'
import { MockOpenTelemetryModule } from './mock-opentelemetry-module'
import { MockRabbitMQModule } from './mock-rabbitmq-module'
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
      .overrideModule(AmqpModule)
      .useModule(MockRabbitMQModule)
      .overrideModule(OpenTelemetryModule)
      .useModule(MockOpenTelemetryModule)
      .overrideModule(BullModule)
      .useModule(MockBullModule)
      .overrideProvider(ServiceProvider.DISCORD_REST)
      .useValue(() => mockDiscordRestClient)
      .overrideProvider(getModelToken(ApiKeyModel.name))
      .useValue(resetMockModel(getModelForClass(ApiKeyModel)))
      .overrideProvider(getModelToken(AuditLogModel.name))
      .useValue(resetMockModel(getModelForClass(AuditLogModel)))
      .overrideProvider(getModelToken(GalleryActivityModel.name))
      .useValue(resetMockModel(getModelForClass(GalleryActivityModel)))
      .overrideProvider(getModelToken(GalleryAlbumModel.name))
      .useValue(resetMockModel(getModelForClass(GalleryAlbumModel)))
      .overrideProvider(getModelToken(GoogleCredentialModel.name))
      .useValue(resetMockModel(getModelForClass(GoogleCredentialModel)))
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
      .overrideProvider(getModelToken(ProfilePhotoModel.name))
      .useValue(resetMockModel(getModelForClass(ProfilePhotoModel)))
      .overrideProvider(getModelToken(RefreshTokenModel.name))
      .useValue(resetMockModel(getModelForClass(RefreshTokenModel)))
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
      .overrideProvider(getModelToken(UserLocalModel.name))
      .useValue(resetMockModel(getModelForClass(UserLocalModel)))
      .overrideProvider(getModelToken(YouTubeVideoModel.name))
      .useValue(resetMockModel(getModelForClass(YouTubeVideoModel)))
      .overrideProvider(getConnectionToken())
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Accounts))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Gallery))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Photo))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Mailer))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getConnectionToken(MongoConnection.Audit))
      .useValue(mockTypegooseConnection)
      .overrideProvider(getDataSourceToken())
      .useValue(jest.fn())
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
