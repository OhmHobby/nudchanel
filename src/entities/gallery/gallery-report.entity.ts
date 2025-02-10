import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
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

  @ManyToMany(() => GalleryPhotoEntity, (photo) => photo.reports)
  @JoinTable()
  photos: GalleryPhotoEntity[]

  @Column({
    type: 'enum',
    enum: GalleryReportState,
    enumName: 'gallery_report_state',
    default: GalleryReportState.pending,
  })
  state: GalleryReportState
}
