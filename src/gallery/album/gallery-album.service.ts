import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Span } from 'nestjs-otel'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import { GalleryAlbumEntity } from 'src/entities/gallery-album.entity'
import { DataSource, LessThanOrEqual, Repository } from 'typeorm'

@Injectable()
export class GalleryAlbumService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GalleryAlbumEntity)
    private readonly albumRepository: Repository<GalleryAlbumEntity>,
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
      return album
    })
  }

  update(id: string, entity: GalleryAlbumEntity) {
    return this.dataSource.transaction(async (manager) => {
      const album = await manager.getRepository(GalleryAlbumEntity).findOneBy({ id })
      if (!album) return false
      Object.assign(album, entity)
      await manager.save(album)
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
}
