import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { Repository } from 'typeorm'

@Injectable()
export class GalleryPhotoService {
  private readonly logger = new Logger(GalleryPhotoService.name)

  constructor(
    @InjectRepository(GalleryPhotoEntity)
    private readonly photoRepository: Repository<GalleryPhotoEntity>,
  ) {}

  async approvePhoto(photoId: string, profile: ProfileIdModel) {
    await this.approvalPrecheck(photoId, profile.uuid)
    await this.photoRepository.update({ id: photoId }, { reviewedBy: profile.uuid })
  }

  async rejectPhoto(photoId: string, profile: ProfileIdModel, reason: GalleryPhotoRejectReason, message?: string) {
    await this.approvalPrecheck(photoId, profile.uuid)
    await this.photoRepository.update(
      { id: photoId },
      { reviewedBy: profile.uuid, rejectReason: reason, rejectMessage: message?.trim() || null },
    )
  }

  async approvalPrecheck(photoId: string, profileUid: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      select: { id: true, validatedAt: true, takenBy: true, errorMessage: true, reviewedBy: true, rejectReason: true },
    })
    this.logger.debug({ message: `Approval precheck ${photoId}`, photo })
    if (!photo) throw new NotFoundException()
    if (!photo.validatedAt) throw new ConflictException(`The photo is pending for validation`)
    if (photo.errorMessage) throw new ConflictException(`The photo has failed the processing pipeline`)
    if (photo.reviewedBy) throw new ConflictException(`The photo has already reviewed`)
    if (photo.rejectReason)
      throw new ConflictException(
        `The photo has been rejected by system. Reset the approval to discard system rejection`,
      )
    if (photo.takenBy === profileUid) throw new ForbiddenException(`Approval could not be made by same photographer`)
  }

  async resetApprovals(id: string) {
    await this.photoRepository.update({ id }, { reviewedBy: null, rejectReason: null, rejectMessage: null })
  }

  async deletePhoto(id: string) {
    await this.photoRepository.softDelete({ id })
  }
}
