import { Injectable, Logger } from '@nestjs/common'
import { ProfileNameResponseModel } from 'src/accounts/models/profile-name.response.model'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { GalleryAlbumPhotoModel } from '../dto/gallery-album-photo.model'
import { Span } from 'nestjs-otel'

@Injectable()
export class GalleryAlbumPhotoService {
  private readonly logger = new Logger(GalleryAlbumPhotoService.name)

  constructor(
    private readonly photoV1Service: PhotoV1Service,
    private readonly profileNameService: ProfileNameService,
  ) {}

  @Span()
  async getPhotoV1ProcessedPhotos(albumId: string): Promise<GalleryAlbumPhotoModel[]> {
    const batches = await this.photoV1Service.getBatchProfilePairs(albumId)
    const batchIds = [...batches.keys()]
    const profileIds = [...batches.values()].filter((el) => !!el)
    const [photos, profileNameMap] = await Promise.all([
      this.photoV1Service.getBatchesProcessedPhotos(batchIds),
      this.profileNameService.getProfilesNameMap(profileIds),
    ])
    const batchProfileNameMap = new Map(
      [...batches]
        .filter(([, profileId]) => !!profileId)
        .map(([batchId, profileId]) => {
          const profile = profileId && profileNameMap.get(profileId.toHexString())
          const response = profile && ProfileNameResponseModel.fromModel(profile)
          return [batchId.toHexString(), response]
        }),
    )
    return photos.map(
      (photo) =>
        new GalleryAlbumPhotoModel({
          id: photo._id?.toHexString(),
          uuid: photo.uuid?.toString(),
          width: photo.width,
          height: photo.height,
          color: photo.color,
          takenBy: batchProfileNameMap.get(photo.batch.toString()),
        }),
    )
  }
}
