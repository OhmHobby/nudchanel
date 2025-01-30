import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { nanoid } from 'nanoid'
import { Span } from 'nestjs-otel'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { DataSource, LessThanOrEqual, Repository } from 'typeorm'
import { AlbumPhotoUploadRule } from '../photo/rules/album-photo-upload-rule'

@Injectable()
export class GalleryAlbumService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GalleryAlbumEntity)
    private readonly albumRepository: Repository<GalleryAlbumEntity>,
    @InjectModel(UploadTaskModel)
    private readonly photoUploadTaskModel: ReturnModelType<typeof UploadTaskModel>,
  ) {}

  @Span()
  async findByActivity(activityId: string, includesUnpublished = false): Promise<GalleryAlbumEntity[]> {
    const albums = await this.albumRepository.find({
      where: {
        activityId,
        published: includesUnpublished ? undefined : true,
        // Will use cron and ignore publishedAt in the future
        publishedAt: includesUnpublished ? undefined : LessThanOrEqual(new Date()),
      },
      order: { rank: 'ASC' },
    })
    return albums
  }

  @Span()
  async findById(id: string): Promise<GalleryAlbumEntity | null> {
    return await this.albumRepository.findOne({
      where: { id },
      relations: { activity: true },
    })
  }

  create(activityId: string, entity: GalleryAlbumEntity): Promise<GalleryAlbumEntity> {
    return this.dataSource.transaction(async (manager) => {
      const albums = await this.findByActivity(activityId, true)
      entity.id = nanoid(GALLERY_ID_LENGTH)
      entity.activityId = activityId
      entity.rank = albums.length
      const album = await manager.save(entity)
      await this.upsertUploadTaskInfo(entity)
      return album
    })
  }

  update(id: string, entity: GalleryAlbumEntity) {
    return this.dataSource.transaction(async (manager) => {
      const album = await manager.getRepository(GalleryAlbumEntity).findOneBy({ id })
      if (!album) return false
      Object.assign(album, entity)
      await manager.save(album)
      await this.upsertUploadTaskInfo(entity)
      return true
    })
  }

  rankAlbums(activityId: string, albumIds: string[]): Promise<GalleryAlbumEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      const rankMapper = Object.fromEntries(albumIds.map((id, i) => [id, i]))
      const albums = await this.findByActivity(activityId, true)
      albums.forEach((album) => (album.rank = rankMapper[album.id] ?? albumIds.length))
      await Promise.all(albums.map((album) => manager.save(album)))
      albums.sort((a, b) => a.rank! - b.rank!)
      return albums
    })
  }

  async remove(id: string) {
    const result = await this.albumRepository.softDelete({ id })
    return !!result.affected
  }

  findUploadTaskInfo(albumId: string): Promise<UploadTaskModel | null> {
    return this.photoUploadTaskModel.findOne({ album: albumId }).exec()
  }

  async upsertUploadTaskInfo(entity: GalleryAlbumEntity): Promise<UploadTaskModel | undefined> {
    if (this.isUploadable(entity)) {
      const doc = await this.photoUploadTaskModel
        .findOneAndUpdate(
          { album: entity.id },
          {
            album: entity.id,
            src_directory: entity.uploadDirectory,
            rules: AlbumPhotoUploadRule.fromEntity(entity).toPattern(),
          },
          { upsert: true, new: true },
        )
        .exec()
      return doc
    }
  }

  isUploadable(entity: GalleryAlbumEntity) {
    return !!entity.uploadDirectory && !!entity.minimumResolutionMp && !!entity.takenAfter && !!entity.takenBefore
  }
}
