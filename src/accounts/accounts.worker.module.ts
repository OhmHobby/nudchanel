import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { AmqpModule } from 'src/amqp/amqp.module'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoModule } from 'src/photo/photo.module'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { DiscordProcessorService } from './discord/discord-processor.service'
import { GroupService } from './group/group.service'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfilePhotoService } from './profile/profile-photo.service'
import { ProfileTeamService } from './profile/profile-team.service'
import { ProfileService } from './profile/profile.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
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
      ],
      MongoConnection.Accounts,
    ),
    TypegooseModule.forFeature([ProfilePhotoModel]),
    BullModule.registerQueue({ name: BullQueueName.Migration, defaultJobOptions: { attempts: 2, backoff: 5000 } }),
    AmqpModule,
    PhotoModule,
  ],
  providers: [
    ProfileService,
    ProfileNameService,
    ProfileTeamService,
    ProfilePhotoService,
    UserLocalService,
    UserGroupService,
    GroupService,
    AccessTokenService,
    RefreshTokenService,
    DiscordProcessorService,
  ],
  exports: [ProfileService, ProfilePhotoService, AccessTokenService, RefreshTokenService, DiscordProcessorService],
})
export class AccountsWorkerModule {}
