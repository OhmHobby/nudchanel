import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GoogleModule } from 'src/google/google.module'
import { YoutubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { GalleryVideoService } from './video/gallery-video.service'
import { GalleryVideoV1Controller } from './video/gallery-video.v1.controller'

@Module({
  imports: [TypegooseModule.forFeature([YoutubeVideoModel], MongoConnection.Gallery), GoogleModule],
  controllers: [GalleryVideoV1Controller],
  providers: [GalleryVideoService],
})
export class GalleryModule {}
