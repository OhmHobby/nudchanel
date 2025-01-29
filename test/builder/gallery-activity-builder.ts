import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryTagEntity } from 'src/entities/gallery/gallery-tag.entity'

export class GalleryActivityBuilder {
  private readonly entity: GalleryActivityEntity

  constructor() {
    this.entity = new GalleryActivityEntity()
    this.entity.id = 'AINfyH5'
    this.entity.title = 'Audition Christmas Night Art & Music Festival'
    this.entity.time = new Date(1607332201618)
    this.entity.cover = 'dd9d66ec-52db-4479-9149-fb0c3883bbce'
    this.entity.tags = [new GalleryTagEntity({ title: 'Tag1' }), new GalleryTagEntity({ title: 'Tag2' })]
    this.entity.published = true
    this.entity.publishedAt = new Date(1607565618871)
  }

  build() {
    return this.entity
  }
}
