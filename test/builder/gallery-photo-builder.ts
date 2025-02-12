import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { uuidv4 } from 'uuidv7'

export class GalleryPhotoBuilder {
  private readonly entity: GalleryPhotoEntity = new GalleryPhotoEntity()

  constructor() {
    this.entity.id = '84500857-9e98-4048-bd3f-52560065bd54'
    this.entity.directory = '/2024/test/(Nickname) FirstnameL'
    this.entity.filename = 'IMG_0000.jpg'
    this.entity.createdBy = '5f26d846-04f1-8000-808f-00186e410100'
    this.entity.albumId = 'dfb7HiX'
    this.entity.createdAt = new Date()
    this.entity.updatedAt = new Date()
  }

  withId(id = uuidv4()) {
    this.entity.id = id
    return this
  }

  withAlbumId(albumId: string | null) {
    this.entity.albumId = albumId
    return this
  }

  withValidatedAt(date: Date | null) {
    this.entity.validatedAt = date
    return this
  }

  withProcessedAt(date: Date | null) {
    this.entity.processedAt = date
    return this
  }

  withReviewedBy(reviewBy: string | null) {
    this.entity.reviewedBy = reviewBy
    return this
  }

  withRejectReason(rejectReason: GalleryPhotoRejectReason | null) {
    this.entity.rejectReason = rejectReason
    return this
  }

  withErrorMessage(errorMessage: string | null) {
    this.entity.errorMessage = errorMessage
    return this
  }

  withTakenBy(takenBy: string | null) {
    this.entity.takenBy = takenBy
    return this
  }

  build() {
    return this.entity
  }
}
