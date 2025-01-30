import { GALLERY_ID_LENGTH, GALLERY_TITLE_LENGTH } from 'src/constants/gallery.constant'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { GalleryActivityEntity } from './gallery-activity.entity'

@Entity('gallery_albums')
export class GalleryAlbumEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryAlbumEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ length: GALLERY_ID_LENGTH })
  id: string

  @Column({ length: GALLERY_TITLE_LENGTH })
  title: string

  @Column({ type: 'uuid', nullable: true, comment: 'Soft relation to photo' })
  cover: string | null

  @Column({ type: 'smallint', default: 0 })
  rank: number

  @ManyToOne(() => GalleryActivityEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: GalleryActivityEntity

  @Column({ name: 'activity_id', type: 'varchar', length: GALLERY_ID_LENGTH, nullable: true })
  activityId: string | null

  @Column({ type: 'boolean', default: false })
  published: boolean

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt: Date | null

  @Column({ name: 'upload_directory', type: 'text', nullable: true })
  uploadDirectory: string | null

  @Column({ name: 'watermark_preset', type: 'text', nullable: true })
  watermarkPreset: string | null

  @Column({ name: 'minimum_resolution_mp', type: 'smallint', nullable: true })
  minimumResolutionMp: number | null

  @Column({ name: 'taken_after', type: 'timestamptz', nullable: true })
  takenAfter: Date | null

  @Column({ name: 'taken_before', type: 'timestamptz', nullable: true })
  takenBefore: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', select: false })
  deletedAt?: Date
}
