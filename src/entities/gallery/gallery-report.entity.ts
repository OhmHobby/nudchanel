import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { GalleryReportState } from 'src/enums/gallery-report-state.enum'

@Entity('gallery_reports')
export class GalleryReportEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  reason: string

  @Column({ name: 'album_id', type: 'uuid', nullable: true })
  albumId: string

  @Column({ name: 'photo_id', type: 'uuid', nullable: true })
  photoId: string

  @Column({
    type: 'enum',
    enum: GalleryReportState,
    enumName: 'gallery_report_state',
    default: GalleryReportState.pending,
  })
  state: GalleryReportState

  @Column({ name: 'report_by_id', default: null, type: 'uuid', nullable: true })
  reportById: string | null = null

  @Column({ name: 'email', type: 'text', nullable: true, default: null })
  email: string | null = null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  constructor(entity?: Partial<GalleryReportEntity>) {
    super()
    Object.assign(this, entity)
  }
}
