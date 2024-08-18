import { Module } from '@nestjs/common'
import { PhotoMinioStorageService } from './photo-minio-storage.service'
import { WebdavStorageService } from './webdav-storage.service'

@Module({
  providers: [PhotoMinioStorageService, WebdavStorageService],
  exports: [PhotoMinioStorageService, WebdavStorageService],
})
export class StorageModule {}
