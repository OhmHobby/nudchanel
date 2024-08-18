import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { MinioStorageAbstractService } from './minio-storage.abstract.service'

@Injectable()
export class PhotoMinioStorageService extends MinioStorageAbstractService {
  constructor(configService: ConfigService) {
    super(
      {
        endPoint: configService.getOrThrow(Config.PHOTO_MINIO_ENDPOINT),
        port: +configService.getOrThrow(Config.PHOTO_MINIO_PORT),
        accessKey: configService.getOrThrow(Config.PHOTO_MINIO_ACCESS_KEY),
        secretKey: configService.getOrThrow(Config.PHOTO_MINIO_SECRET_KEY),
        useSSL: configService.getOrThrow(Config.PHOTO_MINIO_USE_SSL).toString() === 'true',
      },
      configService.getOrThrow(Config.PHOTO_MINIO_BUCKET_NAME),
    )
  }
}
