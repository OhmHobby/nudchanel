import { Module } from '@nestjs/common'
import { PhotoMinioStorageService } from './photo-minio-storage.service'
import { StorageService } from './storage.service'
import { WebdavStorageService } from './webdav-storage.service'

@Module({
  providers: [PhotoMinioStorageService, WebdavStorageService, StorageService],
  exports: [PhotoMinioStorageService, WebdavStorageService, StorageService],
})
export class StorageModule {}
