import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AmqpModule } from 'src/amqp/amqp.module'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { StorageModule } from 'src/storage/storage.module'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { GroupService } from './group/group.service'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfilePhotoService } from './profile/profile-photo.service'
import { ProfileService } from './profile/profile.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { TeamService } from './team/team.service'
import { UserGroupService } from './user/user-group.service'

@Module({
  imports: [
    TypegooseModule.forFeature(
      [
        ProfileModel,
        ProfileNameModel,
        ProfilePhotoModel,
        UserGroupModel,
        GroupModel,
        RefreshTokenModel,
        TeamMemberModel,
        TeamGroupModel,
        TeamRoleModel,
      ],
      MongoConnection.Accounts,
    ),
    TypegooseModule.forFeature([ProfilePhotoModel]),
    TypeOrmModule.forFeature([ProfilePhotoEntity]),
    BullModule.registerQueue({ name: BullQueueName.Photo, defaultJobOptions: { attempts: 2 } }),
    StorageModule,
    AmqpModule,
  ],
  providers: [
    ProfileService,
    ProfileNameService,
    ProfilePhotoService,
    TeamService,
    UserGroupService,
    GroupService,
    AccessTokenService,
    RefreshTokenService,
  ],
  exports: [
    ProfileService,
    ProfileNameService,
    ProfilePhotoService,
    TeamService,
    AccessTokenService,
    RefreshTokenService,
  ],
})
export class AccountsWorkerModule {}
