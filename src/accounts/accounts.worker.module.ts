import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { AmqpModule } from 'src/amqp/amqp.module'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { ProfileModel } from '../models/accounts/profile.model'
import { ProfileNameModel } from '../models/accounts/profile.name.model'
import { AccessTokenService } from './access-token/access-token.service'
import { DiscordProcessorService } from './discord/discord-processor.service'
import { GroupService } from './group/group.service'
import { ProfileNameService } from './profile/profile-name.service'
import { ProfileService } from './profile/profile.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { UserGroupService } from './user/user-group.service'

@Module({
  imports: [
    TypegooseModule.forFeature(
      [ProfileModel, ProfileNameModel, UserGroupModel, GroupModel, RefreshTokenModel],
      MongoConnection.Accounts,
    ),
    TypegooseModule.forFeature([ProfilePhotoModel]),
    BullModule.registerQueue({ name: BullQueueName.Migration, defaultJobOptions: { attempts: 2, backoff: 5000 } }),
    AmqpModule,
  ],
  providers: [
    ProfileService,
    ProfileNameService,
    UserGroupService,
    GroupService,
    AccessTokenService,
    RefreshTokenService,
    DiscordProcessorService,
  ],
  exports: [ProfileService, AccessTokenService, RefreshTokenService, DiscordProcessorService],
})
export class AccountsWorkerModule {}
