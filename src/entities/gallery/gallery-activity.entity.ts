import { GALLERY_ID_LENGTH, GALLERY_TITLE_LENGTH } from 'src/constants/gallery.constant'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { GalleryAlbumEntity } from './gallery-album.entity'
import { GalleryTagEntity } from './gallery-tag.entity'

@Entity('gallery_activities')
export class GalleryActivityEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryActivityEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ length: GALLERY_ID_LENGTH })
  id: string

  @Column({ length: GALLERY_TITLE_LENGTH })
  title: string

  @Column({ type: 'varchar', length: GALLERY_TITLE_LENGTH, nullable: true })
  description: string | null

  @Column({ type: 'uuid', nullable: true, comment: 'Soft relation to photo' })
  cover: string | null

  @Column({ type: 'timestamptz', name: 'time' })
  time: Date

  @Column({ type: 'boolean', default: false })
  published: boolean

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt: Date | null

  @OneToMany(() => GalleryAlbumEntity, (album: GalleryAlbumEntity) => album.activity)
  albums?: GalleryAlbumEntity[]

  @ManyToMany(() => GalleryTagEntity, { eager: true, cascade: true })
  @JoinTable({
    name: 'gallery_activity_tags',
    joinColumn: { name: 'activity_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: GalleryTagEntity[]

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', select: false })
  deletedAt?: Date
}
