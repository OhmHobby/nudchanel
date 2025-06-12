import { OAuth2API } from '@discordjs/core'
import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { REST } from 'discord.js'
import { Auth, google } from 'googleapis'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { PhotoModule } from 'src/photo/photo.module'
import { StorageModule } from 'src/storage/storage.module'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { GroupService } from './group/group.service'
import { NudStudentService } from './nud-student/nud-student.service'
import { NudStudentV1Controller } from './nud-student/nud-student.v1.controller'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfilePhotoService } from './profile/profile-photo.service'
import { ProfileService } from './profile/profile.service'
import { ProfileV1Controller } from './profile/profile.v1.controller'
import { RefreshTokenV1Controller } from './refresh-token/refresh-token-v1.controller'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { RegistrationService } from './registration/registration.service'
import { RegistrationV1Controller } from './registration/registration.v1.controller'
import { DiscordOauth2ProviderService } from './sign-in/oidc/discord/discord-oauth2-provider.service'
import { GoogleOauth2ProviderService } from './sign-in/oidc/google/google-oauth2-provider.service'
import {
  UnintializedGoogleOauth2,
  UnintializedGoogleOauth2Client,
} from './sign-in/oidc/google/uninitialized-google.types'
import { SignInService } from './sign-in/sign-in.service'
import { SignInV1Controller } from './sign-in/sign-in.v1.controller'
import { SignOutV1Controller } from './sign-in/sign-out-v1.controller'
import { TeamMemberV1Controller } from './team/team-member.v1.controller'
import { TeamService } from './team/team.service'
import { UserGroupService } from './user/user-group.service'
import { UserLocalService } from './user/user-local.service'
import { LocalUserV1Controller } from './user/user-local.v1.controller'

@Module({
  imports: [
    TypegooseModule.forFeature(
      [
        ProfileModel,
        ProfileNameModel,
        UserLocalModel,
        UserGroupModel,
        GroupModel,
        TeamMemberModel,
        TeamRoleModel,
        TeamGroupModel,
        RegistrationTokenModel,
      ],
      MongoConnection.Accounts,
    ),
    TypeOrmModule.forFeature([ProfilePhotoEntity, RefreshTokenEntity, NudStudentEntity]),
    BullModule.registerQueue({ name: BullQueueName.Photo, defaultJobOptions: { attempts: 2 } }),
    StorageModule,
    PhotoModule,
  ],
  providers: [
    ProfileService,
    ProfilePhotoService,
    AccessTokenService,
    RefreshTokenService,
    ProfileNameService,
    TeamService,
    DiscordOauth2ProviderService,
    GoogleOauth2ProviderService,
    UserLocalService,
    UserGroupService,
    GroupService,
    SignInService,
    RegistrationService,
    NudStudentService,
    { provide: ServiceProvider.DISCORD_REST, useValue: () => new REST({ authPrefix: 'Bearer' }) },
    {
      provide: ServiceProvider.DISCORD_OAUTH2_API,
      useFactory: (rest: () => REST) => new OAuth2API(rest()),
      inject: [{ token: ServiceProvider.DISCORD_REST, optional: false }],
    },
    {
      provide: ServiceProvider.GOOGLE_OAUTH2_CLIENT,
      useFactory:
        (configService: ConfigService): UnintializedGoogleOauth2Client =>
        (redirectUri?: string) =>
          new google.auth.OAuth2(
            configService.getOrThrow(Config.GAPIS_CLIENT_ID),
            configService.getOrThrow(Config.GAPIS_CLIENT_SECRET),
            redirectUri,
          ),
      inject: [ConfigService],
    },
    {
      provide: ServiceProvider.GOOGLE_OAUTH2,
      useFactory: (): UnintializedGoogleOauth2 => (oauth2Client: Auth.OAuth2Client) =>
        google.oauth2({ auth: oauth2Client, version: 'v2' }),
    },
  ],
  controllers: [
    ProfileV1Controller,
    RefreshTokenV1Controller,
    SignInV1Controller,
    SignOutV1Controller,
    TeamMemberV1Controller,
    LocalUserV1Controller,
    RegistrationV1Controller,
    NudStudentV1Controller,
  ],
  exports: [
    ProfileService,
    ProfileNameService,
    ProfilePhotoService,
    AccessTokenService,
    RefreshTokenService,
    UserLocalService,
  ],
})
export class AccountsModule {}
