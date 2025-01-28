import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { GalleryTagEntity } from './gallery-tag.entity'

@Entity('gallery_activities')
export class GalleryActivityEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryActivityEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ length: GALLERY_ID_LENGTH })
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null

  @Column({ type: 'uuid', nullable: true, comment: 'Soft relation to photo' })
  cover: string | null

  @Column({ type: 'timestamp', name: 'time' })
  time: Date

  @Column({ type: 'boolean', default: false })
  published: boolean

  @Column({ type: 'timestamp', name: 'published_at', nullable: true })
  publishedAt: Date | null

  @ManyToMany(() => GalleryTagEntity, { eager: true, cascade: true })
  @JoinTable({
    name: 'gallery_activity_tags',
    joinColumn: { name: 'activity_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: GalleryTagEntity[]

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', select: false })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', select: false })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', select: false })
  deletedAt?: Date
}
