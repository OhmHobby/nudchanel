import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { ProfileDetailResponseModel } from 'src/accounts/models/profile-detail.response.model'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoFlowState } from 'src/enums/gallery-photo-flow-state.enum'
import { GalleryPhotoNextState } from 'src/enums/gallery-photo-pending-state.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { MD5 } from 'src/helpers/md5.helper'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'

export class GalleryAlbumPhotoModel {
  constructor(model: Partial<GalleryAlbumPhotoModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty({ deprecated: true })
  uuid: string

  @ApiProperty()
  width?: number

  @ApiProperty()
  height?: number

  @ApiProperty()
  timestamp?: Date

  @ApiProperty({ description: 'Color in hex' })
  color?: string

  @ApiPropertyOptional({ type: String, description: 'Thumbnail URL' })
  @Expose()
  get thumbnail() {
    return this.isProcessed ? PhotoUrlHelper.thumbnail(this.uuid) : undefined
  }

  @ApiPropertyOptional({ type: String, description: 'Preview URL' })
  @Expose()
  get preview() {
    return this.isProcessed ? PhotoUrlHelper.preview(this.uuid) : undefined
  }

  @ApiPropertyOptional({ type: ProfileDetailResponseModel })
  takenBy?: ProfileDetailResponseModel

  @ApiPropertyOptional()
  directory?: string

  @ApiPropertyOptional()
  filename?: string

  @ApiPropertyOptional()
  md5?: string

  @ApiPropertyOptional({ enum: GalleryPhotoState })
  state?: GalleryPhotoState

  @ApiPropertyOptional({ enum: GalleryPhotoNextState })
  nextState?: GalleryPhotoNextState | null

  @ApiPropertyOptional({ enum: GalleryPhotoRejectReason })
  rejectReason?: GalleryPhotoRejectReason

  @ApiPropertyOptional()
  rejectMessage?: string

  @ApiPropertyOptional()
  errorMessage?: string

  @ApiPropertyOptional()
  flowProgress?: number

  @Exclude()
  isProcessed: boolean = false

  static fromEntity(entity: GalleryPhotoEntity): GalleryAlbumPhotoModel {
    return new GalleryAlbumPhotoModel({
      id: entity.id,
      uuid: entity.id,
      width: entity.width ?? undefined,
      height: entity.height ?? undefined,
      timestamp: entity.takenWhen ?? undefined,
      md5: MD5.uuidToHex(entity.md5) ?? undefined,
      color: entity.colorHex,
      takenBy: entity.takenBy ? { profileId: ObjectIdUuidConverter.toHexString(entity.takenBy) } : undefined,
      state: entity.state,
      nextState: entity.nextState,
      directory: entity.directory ?? undefined,
      filename: entity.filename ?? undefined,
      rejectReason: entity.rejectReason ?? undefined,
      rejectMessage: entity.rejectMessage ?? undefined,
      errorMessage: entity.errorMessage ?? undefined,
      isProcessed: !!entity.processedAt,
      flowProgress: this.computeFlowProgress(entity),
    })
  }

  withTakenBy(takenBy?: ProfileDetailResponseModel) {
    this.takenBy = takenBy || this.takenBy
    return this
  }

  private static computeFlowProgress(entity: GalleryPhotoEntity): number | undefined {
    let progress = 0
    if (!entity.filename) return undefined

    if (entity.reviewedBy)
      progress |= entity.rejectReason ? GalleryPhotoFlowState.ReviewRejected : GalleryPhotoFlowState.ReviewApproved
    else if (entity.nextState === GalleryPhotoNextState.approval) progress |= GalleryPhotoFlowState.ReviewPending

    if (entity.processedAt)
      progress |= entity.errorMessage ? GalleryPhotoFlowState.ProcessingFailed : GalleryPhotoFlowState.Processed
    else if (entity.nextState === GalleryPhotoNextState.processing) progress |= GalleryPhotoFlowState.Processing

    if (entity.validatedAt) {
      if (entity.rejectReason && progress < GalleryPhotoFlowState.ValidationAccepted)
        progress |= GalleryPhotoFlowState.ValidationRejected
      else if (entity.errorMessage && progress < GalleryPhotoFlowState.ValidationAccepted)
        progress |= GalleryPhotoFlowState.ValidationFailed
      else progress |= GalleryPhotoFlowState.ValidationAccepted
    } else if (entity.nextState === GalleryPhotoNextState.validation)
      progress |= GalleryPhotoFlowState.ValidationPending
    else if (entity.errorMessage) return GalleryPhotoFlowState.Failed

    progress |= GalleryPhotoFlowState.Created
    return progress
  }
}
