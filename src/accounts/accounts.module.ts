import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoModule } from 'src/photo/photo.module'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { GroupService } from './group/group.service'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfilePhotoService } from './profile/profile-photo.service'
import { ProfileTeamService } from './profile/profile-team.service'
import { ProfileService } from './profile/profile.service'
import { ProfileV1Controller } from './profile/profile.v1.controller'
import { RefreshTokenV1Controller } from './refresh-token/refresh-token-v1.controller'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { SignInV1Controller } from './sign-in/sign-in.v1.controller'
import { UserGroupService } from './user/user-group.service'
import { UserLocalService } from './user/user-local.service'

@Module({
  imports: [
    TypegooseModule.forFeature(
      [ProfileModel, ProfileNameModel, UserLocalModel, UserGroupModel, GroupModel, RefreshTokenModel],
      MongoConnection.Accounts,
    ),
    TypegooseModule.forFeature([ProfilePhotoModel]),
    PhotoModule,
  ],
  providers: [
    ProfileService,
    ProfilePhotoService,
    AccessTokenService,
    RefreshTokenService,
    ProfileNameService,
    ProfileTeamService,
    UserLocalService,
    UserGroupService,
    GroupService,
  ],
  controllers: [ProfileV1Controller, RefreshTokenV1Controller, SignInV1Controller],
  exports: [ProfileService, ProfilePhotoService, AccessTokenService, RefreshTokenService],
})
export class AccountsModule {}
