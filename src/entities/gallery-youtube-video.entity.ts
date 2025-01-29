import { GALLERY_ID_LENGTH, YOUTUBE_ID_LENGTH } from 'src/constants/gallery.constant'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { GalleryActivityEntity } from './gallery-activity.entity'

@Entity('gallery_youtube_videos')
export class GalleryYouTubeVideoEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryYouTubeVideoEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryColumn({ length: YOUTUBE_ID_LENGTH })
  id: string

  @ManyToOne(() => GalleryActivityEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: GalleryActivityEntity

  @Column({ name: 'activity_id', type: 'varchar', length: GALLERY_ID_LENGTH, nullable: true })
  activityId: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
  createdAt: Date
}
