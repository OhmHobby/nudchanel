import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryTagEntity } from 'src/entities/gallery/gallery-tag.entity'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  static readonly entities = [
    GalleryActivityEntity,
    GalleryAlbumEntity,
    GalleryPhotoEntity,
    GalleryTagEntity,
    GalleryYouTubeVideoEntity,
    ApplicationSettingEntity,
    DataMigrationEntity,
  ]

  static readonly migrations = ['dist/migrations/*.js']

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get(Config.PG_HOST),
      port: this.configService.get(Config.PG_PORT),
      username: this.configService.get(Config.PG_USER),
      password: this.configService.get(Config.PG_PASS),
      database: this.configService.get(Config.PG_DB),
      entities: TypeormConfigService.entities,
      migrations: TypeormConfigService.migrations,
      migrationsRun: this.configService.get(Config.DB_MIGRATION),
      synchronize: false,
      logging: this.configService.get(Config.LOG_LEVEL) === 'debug',
    }
  }
}
