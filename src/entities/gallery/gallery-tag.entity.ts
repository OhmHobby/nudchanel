import { GALLERY_TAG_LENGTH } from 'src/constants/gallery.constant'
import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('gallery_tags')
@Unique('UNIQUE_TAG_TITLE', (entity: GalleryTagEntity) => [entity.title])
export class GalleryTagEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryTagEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ length: GALLERY_TAG_LENGTH })
  title: string
}
