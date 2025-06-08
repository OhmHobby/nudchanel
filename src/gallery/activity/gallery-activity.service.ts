import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Span } from 'nestjs-otel'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryTagEntity } from 'src/entities/gallery/gallery-tag.entity'
import { mergeObject } from 'src/helpers/merge-object.helper'
import {
  And,
  DataSource,
  EntityManager,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  Repository,
} from 'typeorm'

@Injectable()
export class GalleryActivityService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GalleryActivityEntity)
    private readonly activityRepository: Repository<GalleryActivityEntity>,
    @InjectRepository(GalleryAlbumEntity)
    private readonly albumRepository: Repository<GalleryAlbumEntity>,
  ) {}

  @Span()
  async findById(id: string): Promise<GalleryActivityEntity | null> {
    const activity = await this.activityRepository.findOneBy({ id })
    return activity
  }

  create(entity: GalleryActivityEntity): Promise<GalleryActivityEntity> {
    return this.dataSource.transaction(async (manager) => {
      entity.id = nanoid(GALLERY_ID_LENGTH)
      entity.tags = await this.resolveTagEntities(entity.tags)(manager)
      const activity = await manager.save(entity)
      return activity
    })
  }

  update(id: string, entity: GalleryActivityEntity) {
    return this.dataSource.transaction(async (manager) => {
      entity.tags = await this.resolveTagEntities(entity.tags)(manager)
      const activity = await manager.getRepository(GalleryActivityEntity).findOneBy({ id })
      if (!activity) return false
      mergeObject(activity, entity)
      await manager.save(activity)
      return true
    })
  }

  async remove(id: string) {
    const result = await this.activityRepository.softDelete({ id })
    return !!result.affected
  }

  @Span()
  async findActivities(limit: number, before?: Date, year?: number, search?: string, includesUnpublished = false) {
    const minKeywordLength = 3
    const beforeDate = this.selectEailerDate(before, this.academicYearEndDate(year))
    const afterDate = this.academicYearStartDate(year)
    const keywords = search?.split(/\s+/).filter((el) => el.length >= minKeywordLength)
    const baseCondition: FindOptionsWhere<GalleryActivityEntity> = {
      time: this.buildTimeQuery(afterDate, beforeDate),
      published: includesUnpublished ? undefined : true,
      // Will use cron and ignore publishedAt in the future
      publishedAt: includesUnpublished ? undefined : LessThanOrEqual(new Date()),
    }
    const activityIds = await this.findFromAlbumTitle(keywords)
    const activities = await this.activityRepository.find({
      where: keywords?.length
        ? [
            { title: keywords ? ILike(`%${keywords.join('%')}%`) : undefined, ...baseCondition },
            { tags: keywords ? { title: In(keywords) } : undefined, ...baseCondition },
            { id: activityIds.length ? In(activityIds) : undefined, ...baseCondition },
          ]
        : baseCondition,
      order: { time: 'desc' },
      take: limit,
      relations: { tags: true },
    })
    return activities
  }

  async findFromAlbumTitle(keywords?: string[]): Promise<string[]> {
    if (!keywords?.length) return []
    const result = await this.albumRepository.find({
      where: { title: ILike(`%${keywords.join('%')}%`) },
      select: { activityId: true },
    })
    return result.map(({ activityId }) => activityId).filter((id): id is string => id !== null)
  }

  selectEailerDate(a?: Date, b?: Date): Date | undefined {
    if (a && b) {
      return a < b ? a : b
    }
    return a || b
  }

  academicYearStartDate(year?: number): Date | undefined {
    const mayMonthIndex = 4
    const newAcademicYearStartAt = mayMonthIndex
    const startAtDate = 1
    return year ? new Date(year, newAcademicYearStartAt, startAtDate, 0, 0, 0, 0) : undefined
  }

  academicYearEndDate(year?: number): Date | undefined {
    return year ? this.academicYearStartDate(year + 1) : undefined
  }

  private buildTimeQuery(afterDate?: Date, beforeDate?: Date): FindOperator<Date> | undefined {
    if (afterDate && beforeDate) return And(MoreThan(afterDate), LessThan(beforeDate))
    else if (afterDate) return MoreThan(afterDate)
    else if (beforeDate) return LessThan(beforeDate)
    else return undefined
  }

  private resolveTagEntities(tags: GalleryTagEntity[]) {
    return (manager: EntityManager) => {
      const tagRepository = manager.getRepository(GalleryTagEntity)
      return Promise.all(
        tags.map((tag) => tagRepository.findOneBy({ title: tag.title }).then((entity) => entity ?? manager.save(tag))),
      )
    }
  }
}
