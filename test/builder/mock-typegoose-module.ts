import { getModelToken } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { getModelForClass } from '@typegoose/typegoose'
import { GroupModel } from 'src/models/accounts/group.model'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { RefreshTokenModel } from 'src/models/accounts/refresh-token.model'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { resetMockModel } from 'test/helpers/mock-model'

@Module({
  providers: [
    {
      provide: getModelToken(ProfileModel.name),
      useValue: resetMockModel(getModelForClass(ProfileModel)),
    },
    {
      provide: getModelToken(ProfileNameModel.name),
      useValue: resetMockModel(getModelForClass(ProfileNameModel)),
    },
    {
      provide: getModelToken(UserLocalModel.name),
      useValue: resetMockModel(getModelForClass(UserLocalModel)),
    },
    {
      provide: getModelToken(UserGroupModel.name),
      useValue: resetMockModel(getModelForClass(UserGroupModel)),
    },
    {
      provide: getModelToken(GroupModel.name),
      useValue: resetMockModel(getModelForClass(GroupModel)),
    },
    {
      provide: getModelToken(RefreshTokenModel.name),
      useValue: resetMockModel(getModelForClass(RefreshTokenModel)),
    },
    {
      provide: getModelToken(GalleryActivityModel.name),
      useValue: resetMockModel(getModelForClass(GalleryActivityModel)),
    },
    {
      provide: getModelToken(GalleryAlbumModel.name),
      useValue: resetMockModel(getModelForClass(GalleryAlbumModel)),
    },
    {
      provide: getModelToken(YouTubeVideoModel.name),
      useValue: resetMockModel(getModelForClass(YouTubeVideoModel)),
    },
  ],
})
export class MockTypegooseModule {}
