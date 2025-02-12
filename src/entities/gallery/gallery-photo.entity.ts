import { BadRequestException } from '@nestjs/common'
import { join } from 'path'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import { GalleryPhotoNextState } from 'src/enums/gallery-photo-pending-state.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { Orientation } from 'src/enums/orientation.enum'
import { HexDecConverter } from 'src/helpers/hex-dec-converter'
import {
  BaseEntity,
  Check,
  Column,
  CreateDateColumn,
  DeepPartial,
  DeleteDateColumn,
  Entity,
  FindOptionsWhere,
  IsNull,
  JoinColumn,
  ManyToOne,
  Not,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { uuidv4 } from 'uuidv7'
import { GalleryAlbumEntity } from './gallery-album.entity'

@Entity('gallery_photos')
export class GalleryPhotoEntity extends BaseEntity {
  constructor(entity?: DeepPartial<GalleryPhotoEntity>) {
    super()
    Object.assign(this, entity)
  }

  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4()

  @Column({ type: 'text' })
  directory: string

  @Column({ type: 'text' })
  filename: string

  /** Meta data */

  @Column({ type: 'uuid', nullable: true })
  md5: string | null

  @Column({ type: 'smallint', nullable: true })
  @Check('width must be greater than 0', 'width > 0')
  width: number | null

  @Column({ type: 'smallint', nullable: true })
  @Check('height must be greater than 0', 'height > 0')
  height: number | null

  @Column({ type: 'enum', enum: Orientation, enumName: 'image_orientation', nullable: true })
  orientation: Orientation | null

  @Column({ name: 'taken_when', type: 'timestamptz', nullable: true })
  takenWhen: Date | null

  @Column({ name: 'taken_by', type: 'uuid', nullable: true })
  takenBy: string | null

  @Column({ type: 'integer', nullable: true })
  @Check('color must be between 0 and 16777215', 'color >= 0 AND color <= 16777215')
  color: number | null

  /** State */

  @Column({ name: 'validated_at', type: 'timestamptz', nullable: true })
  validatedAt: Date | null

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null

  @Column({
    name: 'reject_reason',
    type: 'enum',
    enum: GalleryPhotoRejectReason,
    enumName: 'gallery_photo_reject_reason',
    nullable: true,
  })
  rejectReason: GalleryPhotoRejectReason | null

  @Column({ name: 'reject_message', type: 'text', nullable: true })
  rejectMessage: string | null

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null

  /** Reference */

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string

  @Column({ name: 'import_id', type: 'uuid', nullable: true })
  importId: string | null

  @ManyToOne(() => GalleryAlbumEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'album_id' })
  album?: GalleryAlbumEntity

  @Column({ name: 'album_id', type: 'varchar', length: GALLERY_ID_LENGTH, nullable: true })
  albumId: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', select: false })
  deletedAt?: Date

  get colorHex(): string | undefined {
    return typeof this.color === 'number' ? HexDecConverter.decToHex(this.color) : undefined
  }

  get state(): GalleryPhotoState {
    if (this.errorMessage) return GalleryPhotoState.failed
    if (this.rejectReason) return GalleryPhotoState.rejected
    if (this.reviewedBy) return GalleryPhotoState.approved
    if (this.processedAt) return GalleryPhotoState.processed
    if (this.validatedAt) return GalleryPhotoState.accepted
    return GalleryPhotoState.created
  }

  get nextState(): GalleryPhotoNextState | undefined {
    switch (this.state) {
      case GalleryPhotoState.created:
        return GalleryPhotoNextState.validation
      case GalleryPhotoState.accepted:
        return GalleryPhotoNextState.processing
      case GalleryPhotoState.processed:
        return GalleryPhotoNextState.approval
      default:
        return undefined
    }
  }

  get source(): string {
    return this.importId ? 'import' : 'upload'
  }

  get fullpath(): string {
    return join(this.directory, this.filename)
  }

  static stateFromNextState(nextState?: GalleryPhotoNextState): GalleryPhotoState | undefined {
    switch (nextState) {
      case GalleryPhotoNextState.validation:
        return GalleryPhotoState.created
      case GalleryPhotoNextState.processing:
        return GalleryPhotoState.accepted
      case GalleryPhotoNextState.approval:
        return GalleryPhotoState.processed
      default:
        return undefined
    }
  }

  static findByStateOptionsWhere(state?: GalleryPhotoState): FindOptionsWhere<GalleryPhotoEntity> {
    const optionsWhere: FindOptionsWhere<GalleryPhotoEntity> = {
      errorMessage: IsNull(),
      rejectReason: IsNull(),
      reviewedBy: IsNull(),
      processedAt: IsNull(),
      validatedAt: IsNull(),
    }
    switch (state) {
      case undefined:
        return {}
      case GalleryPhotoState.failed:
        return { errorMessage: Not(IsNull()) }
      case GalleryPhotoState.rejected:
        return { rejectReason: Not(IsNull()) }
      // @ts-expect-error Shared the below criteria
      case GalleryPhotoState.approved:
        optionsWhere.reviewedBy = Not(IsNull())
      // @ts-expect-error Shared the below criteria
      case GalleryPhotoState.processed:
        optionsWhere.processedAt = Not(IsNull())
      // @ts-expect-error Shared the below criteria
      case GalleryPhotoState.accepted:
        optionsWhere.validatedAt = Not(IsNull())
      case GalleryPhotoState.created:
        return optionsWhere
      default:
        throw new BadRequestException(`${state} is not supported`)
    }
  }
}
