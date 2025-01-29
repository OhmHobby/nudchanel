import { DocumentType } from '@typegoose/typegoose'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery-album.entity'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

export class GalleryAlbumBuilder {
  private readonly galleryAlbum: DocumentType<GalleryAlbumModel>

  private readonly entity: GalleryAlbumEntity = new GalleryAlbumEntity()

  constructor() {
    this.galleryAlbum = new GalleryAlbumModel() as DocumentType<GalleryAlbumModel>
    this.galleryAlbum._id = 'PNBwEli'
    this.galleryAlbum.title = 'Music Band Audition'
    this.galleryAlbum.rank = 0
    this.galleryAlbum.cover = 'd98a9bb3-2895-4f2f-9c3d-f39a1f2c8819'
    this.galleryAlbum.published = true
    this.galleryAlbum.publishedAt = new Date(1607544267171)
    this.galleryAlbum.activity = 'AINfyH5'

    this.entity.id = 'PNBwEli'
    this.entity.title = 'Music Band Audition'
    this.entity.rank = 0
    this.entity.cover = 'd98a9bb3-2895-4f2f-9c3d-f39a1f2c8819'
    this.entity.published = true
    this.entity.publishedAt = new Date(1607544267171)
    this.entity.activityId = 'AINfyH5'

    this.galleryAlbum.save = jest.fn()
  }

  withId(id: string) {
    this.galleryAlbum._id = id
    this.entity.id = id
    return this
  }

  withActivity(activity: GalleryActivityEntity) {
    this.entity.activity = activity
    this.entity.activityId = activity.id
    return this
  }

  build() {
    return this.galleryAlbum
  }

  buildEntity() {
    return this.entity
  }
}
