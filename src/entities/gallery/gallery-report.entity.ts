import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { GalleryPhotoEntity } from './gallery-photo.entity'
import { GALLERY_REPORT_TITLE_LENGTH } from 'src/constants/gallery.constant'
import { GalleryReportState } from 'src/enums/gallery-report-state.enum'

@Entity('gallery_reports')
export class GalleryReportEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ length: GALLERY_REPORT_TITLE_LENGTH })
  title: string

  @Column({ type: 'text' })
  description: string

  @ManyToOne(() => GalleryPhotoEntity, (photo) => photo.reports)
  @JoinColumn({ name: 'photo_id' })
  photo: GalleryPhotoEntity

  @Column({ name: 'photo_id', type: 'uuid' })
  photoId: string

  @Column({
    type: 'enum',
    enum: GalleryReportState,
    enumName: 'gallery_report_state',
    default: GalleryReportState.pending,
  })
  state: GalleryReportState

  @Column({ name: 'report_by_id', type: 'uuid' })
  reportById: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  constructor(entity?: Partial<GalleryReportEntity>) {
    super()
    Object.assign(this, entity)
  }
}
