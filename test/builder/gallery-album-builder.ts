import { GalleryActivityModel } from 'src/models/gallery/activity.model'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

export class GalleryAlbumBuilder {
  private readonly galleryAlbum: GalleryAlbumModel

  constructor() {
    this.galleryAlbum = new GalleryAlbumModel()
    this.galleryAlbum._id = 'PNBwEli'
    this.galleryAlbum.title = 'Music Band Audition'
    this.galleryAlbum.rank = 0
    this.galleryAlbum.cover = 'd98a9bb3-2895-4f2f-9c3d-f39a1f2c8819'
    this.galleryAlbum.published = true
    this.galleryAlbum.publishedAt = new Date(1607544267171)
    this.galleryAlbum.activity = 'AINfyH5'
  }

  withId(id: string) {
    this.galleryAlbum._id = id
    return this
  }

  withPublished(published: boolean) {
    this.galleryAlbum.published = published
    return this
  }

  withActivity(activity: GalleryActivityModel) {
    this.galleryAlbum.activity = activity as any
    return this
  }

  build() {
    return this.galleryAlbum
  }
}
