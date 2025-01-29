import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'

export class GalleryAlbumBuilder {
  private readonly entity: GalleryAlbumEntity = new GalleryAlbumEntity()

  constructor() {
    this.entity.id = 'PNBwEli'
    this.entity.title = 'Music Band Audition'
    this.entity.rank = 0
    this.entity.cover = 'd98a9bb3-2895-4f2f-9c3d-f39a1f2c8819'
    this.entity.published = true
    this.entity.publishedAt = new Date(1607544267171)
    this.entity.activityId = 'AINfyH5'
  }

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withActivity(activity: GalleryActivityEntity) {
    this.entity.activity = activity
    this.entity.activityId = activity.id
    return this
  }

  build() {
    return this.entity
  }
}
