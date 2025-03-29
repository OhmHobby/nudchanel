import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsModule } from 'src/accounts/accounts.module'
import { IsForbiddenField } from 'src/auth/is-forbidden-field.validator'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
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
import { GalleryPhotoService } from './photo/gallery-photo.service'
import { GalleryPhotoV1Controller } from './photo/gallery-photo.v1.controller'
import { GalleryVideoService } from './video/gallery-video.service'
import { GalleryVideoV1Controller } from './video/gallery-video.v1.controller'
import { GalleryReportService } from './report/gallery-report.service'
import { GalleryReportEntity } from 'src/entities/gallery/gallery-report.entity'
import { GalleryReportController } from './report/gallery-report.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GalleryActivityEntity,
      GalleryAlbumEntity,
      GalleryPhotoEntity,
      GalleryYouTubeVideoEntity,
      GalleryReportEntity,
      DataMigrationEntity,
    ]),
    TypegooseModule.forFeature([UploadTaskModel], MongoConnection.Photo),
    BullModule.registerQueue({
      name: BullQueueName.GalleryPhotoValidation,
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
        backoff: { type: 'exponential', delay: 5000 },
      },
    }),
    AccountsModule,
    GoogleModule,
    PhotoModule,
    StorageModule,
  ],
  controllers: [
    GalleryActivityV1Controller,
    GalleryAlbumV1Controller,
    GalleryAlbumPhotoV1Controller,
    GalleryPhotoV1Controller,
    GalleryVideoV1Controller,
    GalleryReportController,
  ],
  providers: [
    GalleryActivityService,
    GalleryAlbumService,
    GalleryAlbumPhotoService,
    GalleryPhotoService,
    GalleryVideoService,
    IsForbiddenField,
    GalleryReportService,
  ],
})
export class GalleryModule {}
