import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsModule } from 'src/accounts/accounts.module'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GoogleModule } from 'src/google/google.module'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { PhotoModule } from 'src/photo/photo.module'
import { StorageModule } from 'src/storage/storage.module'
import { GalleryActivityService } from './activity/gallery-activity.service'
import { GalleryActivityV1Controller } from './activity/gallery-activity.v1.controller'
import { GalleryAlbumService } from './album/gallery-album.service'
import { GalleryAlbumV1Controller } from './album/gallery-album.v1.controller'
import { GalleryAlbumPhotoService } from './photo/gallery-album-photo.service'
import { GalleryAlbumPhotoV1Controller } from './photo/gallery-album-photo.v1.controller'
import { GalleryVideoService } from './video/gallery-video.service'
import { GalleryVideoV1Controller } from './video/gallery-video.v1.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GalleryActivityEntity,
      GalleryAlbumEntity,
      GalleryPhotoEntity,
      GalleryYouTubeVideoEntity,
    ]),
    TypegooseModule.forFeature([UploadTaskModel], MongoConnection.Photo),
    AccountsModule,
    GoogleModule,
    PhotoModule,
    StorageModule,
  ],
  controllers: [
    GalleryActivityV1Controller,
    GalleryAlbumV1Controller,
    GalleryAlbumPhotoV1Controller,
    GalleryVideoV1Controller,
  ],
  providers: [
    GalleryActivityService,
    GalleryAlbumService,
    GalleryAlbumPhotoService,
    GalleryVideoService,
    IsForbiddenField,
  ],
})
export class GalleryModule {}
