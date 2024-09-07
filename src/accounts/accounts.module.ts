import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { SignInTokenModel } from 'src/models/accounts/signin-token.model'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoModule } from 'src/photo/photo.module'
import { StorageModule } from 'src/storage/storage.module'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { GroupService } from './group/group.service'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfilePhotoService } from './profile/profile-photo.service'
import { ProfileService } from './profile/profile.service'
import { ProfileV1Controller } from './profile/profile.v1.controller'
import { RefreshTokenV1Controller } from './refresh-token/refresh-token-v1.controller'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { RegistrationService } from './registration/registration.service'
import { DiscordOauth2ProviderService } from './sign-in/oidc/discord-oauth2-provider.service'
import { GoogleOauth2ProviderService } from './sign-in/oidc/google-oauth2-provider.service'
import { SignInExternalController } from './sign-in/oidc/sign-in-external.controller'
import { SignInService } from './sign-in/sign-in.service'
import { SignInV1Controller } from './sign-in/sign-in.v1.controller'
import { SignOutV1Controller } from './sign-in/sign-out-v1.controller'
import { TeamMemberV1Controller } from './team/team-member.v1.controller'
import { TeamService } from './team/team.service'
import { UserGroupService } from './user/user-group.service'
import { UserLocalService } from './user/user-local.service'

@Module({
  imports: [
    TypegooseModule.forFeature(
      [
        ProfileModel,
        ProfileNameModel,
        UserLocalModel,
        UserGroupModel,
        GroupModel,
        RefreshTokenModel,
        TeamMemberModel,
        TeamRoleModel,
        TeamGroupModel,
        SignInTokenModel,
        RegistrationTokenModel,
      ],
      MongoConnection.Accounts,
    ),
    TypegooseModule.forFeature([ProfilePhotoModel]),
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
  ],
  controllers: [
    ProfileV1Controller,
    RefreshTokenV1Controller,
    SignInExternalController,
    SignInV1Controller,
    SignOutV1Controller,
    TeamMemberV1Controller,
  ],
  exports: [ProfileService, ProfileNameService, ProfilePhotoService, AccessTokenService, RefreshTokenService],
})
export class AccountsModule {}
