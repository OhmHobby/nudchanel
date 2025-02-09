import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { PhotoWorkerModule } from 'src/photo/photo.worker.module'
import { StorageModule } from 'src/storage/storage.module'
import { GalleryAlbumPhotoValidatorProcessorService } from './photo/gallery-album-photo-validator-processor.service'

@Module({
  imports: [TypeOrmModule.forFeature([GalleryAlbumEntity, GalleryPhotoEntity]), PhotoWorkerModule, StorageModule],
  providers: [GalleryAlbumPhotoValidatorProcessorService],
})
export class GalleryWorkerModule {}
