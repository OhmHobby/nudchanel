import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GoogleModule } from 'src/google/google.module'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { GalleryActivityService } from './activity/gallery-activity.service'
import { GalleryActivityV1Controller } from './activity/gallery-activity.v1.controller'
import { GalleryAlbumService } from './album/gallery-album.service'
import { GalleryAlbumV1Controller } from './album/gallery-album.v1.controller'
import { GalleryVideoService } from './video/gallery-video.service'
import { GalleryVideoV1Controller } from './video/gallery-video.v1.controller'

@Module({
  imports: [
    TypegooseModule.forFeature([GalleryActivityModel, GalleryAlbumModel, YouTubeVideoModel], MongoConnection.Gallery),
    GoogleModule,
  ],
  controllers: [GalleryActivityV1Controller, GalleryAlbumV1Controller, GalleryVideoV1Controller],
  providers: [GalleryActivityService, GalleryAlbumService, GalleryVideoService],
})
export class GalleryModule {}
