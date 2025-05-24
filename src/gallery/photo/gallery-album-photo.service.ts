import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { Span } from 'nestjs-otel'
import { basename, join } from 'path'
import { ProfileDetailResponseModel } from 'src/accounts/models/profile-detail.response.model'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DataMigration } from 'src/enums/data-migration.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { MD5 } from 'src/helpers/md5.helper'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { StorageService } from 'src/storage/storage.service'
import { Repository } from 'typeorm'
import { uuidv7 } from 'uuidv7'
import { GalleryAlbumPhotoModel } from '../dto/gallery-album-photo.model'
import { GalleryAlbumPhotosModel } from '../dto/gallery-album-photos.model'

@Injectable()
export class GalleryAlbumPhotoService implements OnModuleDestroy {
  private readonly logger = new Logger(GalleryAlbumPhotoService.name)

  constructor(
    @InjectRepository(GalleryAlbumEntity)
    private readonly albumRepository: Repository<GalleryAlbumEntity>,
    @InjectRepository(GalleryPhotoEntity)
    private readonly photoRepository: Repository<GalleryPhotoEntity>,
    @InjectRepository(DataMigrationEntity)
    private readonly dataMigrationRepository: Repository<DataMigrationEntity>,
    @InjectQueue(BullQueueName.GalleryPhotoValidation)
    private readonly galleryPhotoValidationQueue: Queue<GalleryPhotoEntity>,
    private readonly photoV1Service: PhotoV1Service,
    private readonly profileNameService: ProfileNameService,
    private readonly storageService: StorageService,
  ) {}

  @Span()
  async getPhotoV1ProcessedPhotos(albumId: string): Promise<GalleryAlbumPhotosModel> {
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
          const profileName = profileId && profileNameMap.get(profileId.toHexString())
          const response = profileName && ProfileDetailResponseModel.fromModel(profileName)
          return [batchId.toHexString(), response]
        }),
    )
    return new GalleryAlbumPhotosModel({
      contributors: [...profileNameMap.values()].map((profileNameModel) =>
        ProfileDetailResponseModel.fromModel(profileNameModel),
      ),
      photos: photos.map(
        (photo) =>
          new GalleryAlbumPhotoModel({
            id: photo.uuid?.toString(),
            uuid: photo.uuid?.toString(),
            width: photo.width,
            height: photo.height,
            color: photo.color,
            timestamp: photo.taken_timestamp,
            takenBy: batchProfileNameMap.get(photo.batch.toString()),
            isProcessed: true,
          }),
      ),
    })
  }

  async getGalleryAlbumPhotos(albumId: string) {
    const isMigrated = await this.dataMigrationRepository.existsBy({ id: DataMigration.GalleryPhoto })
    if (isMigrated) {
      return this.getUploadPhotos(albumId, undefined, GalleryPhotoState.approved)
    } else {
      return this.getPhotoV1ProcessedPhotos(albumId)
    }
  }

  @Span()
  async getUploadPhotos(
    albumId: string,
    uploadByProfileUid?: string,
    state?: GalleryPhotoState,
    selectAll = false,
  ): Promise<GalleryAlbumPhotosModel> {
    const photos = await this.photoRepository.find({
      where: { albumId, takenBy: uploadByProfileUid, ...GalleryPhotoEntity.findByStateOptionsWhere(state) },
      select: selectAll
        ? undefined
        : { id: true, width: true, height: true, takenWhen: true, color: true, takenBy: true, processedAt: true },
      order: { takenWhen: 'ASC' },
    })
    const profileUidOidMap = Object.fromEntries(
      [...new Set(photos.map((el) => el.takenBy).filter((el) => typeof el === 'string'))].map((el) => [
        el,
        ObjectIdUuidConverter.toObjectId(el),
      ]),
    )
    const profileNameMap = await this.profileNameService.getProfilesNameMap(Object.values(profileUidOidMap))
    const profileUidNameMap = Object.fromEntries(
      Object.entries(profileUidOidMap).map(([uid, oid]) => {
        const profileName = profileNameMap.get(oid.toHexString())
        return [uid, profileName ? ProfileDetailResponseModel.fromModel(profileName) : undefined]
      }),
    )
    return new GalleryAlbumPhotosModel({
      contributors: [...profileNameMap.values()].map((profileNameModel) =>
        ProfileDetailResponseModel.fromModel(profileNameModel),
      ),
      photos: photos.map((photo) =>
        GalleryAlbumPhotoModel.fromEntity(photo).withTakenBy(
          photo.takenBy ? profileUidNameMap[photo.takenBy] : undefined,
        ),
      ),
    })
  }

  async getUploadContributors(albumId: string): Promise<ProfileDetailResponseModel[]> {
    const photos = await this.photoRepository
      .createQueryBuilder()
      .select('taken_by', 'takenBy')
      .distinct(true)
      .where('album_id = :albumId', { albumId })
      .andWhere('taken_by IS NOT NULL')
      .getRawMany<Pick<GalleryPhotoEntity, 'takenBy'>>()
    const profileOids = photos.map((el) => ObjectIdUuidConverter.toObjectId(el.takenBy!))
    const profileNames = await this.profileNameService.getProfilesName(profileOids)
    return profileNames.map((el) => ProfileDetailResponseModel.fromModel(el))
  }

  async uploadFile(
    albumId: string,
    profileId: ProfileIdModel,
    originalname: string,
    buffer: Buffer,
  ): Promise<GalleryPhotoEntity> {
    const [album, profileDirectory] = await Promise.all([
      this.albumInfoForPhotoProcessing(albumId),
      this.profileNameService.getNickNameWithFirstNameAndInitial(profileId.objectId),
    ])
    if (!album?.uploadDirectory) throw new NotFoundException()

    const entity = new GalleryPhotoEntity({
      directory: join(album.uploadDirectory, profileDirectory ?? profileId.uuid),
      filename: originalname,
      md5: MD5.fromBuffer(buffer).hex,
      takenBy: profileId.uuid,
      createdBy: profileId.uuid,
      albumId,
      album,
    })

    await this.storageService.putFile(entity.fullpath, buffer)
    this.logger.log(`Uploaded ${originalname} to ${entity.fullpath}`)
    await this.photoRepository.insert(entity) // do not use .save to prevent cascading album field
    await this.galleryPhotoValidationQueue.add(entity.id, entity)
    return entity
  }

  async importFiles(albumId: string, directory: string, importByUid: ProfileIdModel, takenByUid?: ProfileIdModel) {
    const importId = uuidv7()
    const [album, files] = await Promise.all([
      this.albumInfoForPhotoProcessing(albumId),
      this.storageService.listFiles(directory),
    ])
    if (!album?.uploadDirectory) throw new NotFoundException()
    if (!directory.includes(album.uploadDirectory)) throw new BadRequestException('Directory mismatch')

    const entities = files.map(
      (file) =>
        new GalleryPhotoEntity({
          directory,
          filename: basename(file),
          takenBy: takenByUid?.uuid,
          createdBy: importByUid.uuid,
          albumId,
          importId,
          album,
        }),
    )
    await this.photoRepository.insert(entities)
    await this.galleryPhotoValidationQueue.addBulk(entities.map((entity) => ({ name: entity.id, data: entity })))
    return entities
  }

  validateMimeOrThrow(mimeType: string) {
    if (!mimeType.startsWith('image/')) {
      this.logger.warn(`Unexpected mimeType ${mimeType} has uploaded`)
      throw new BadRequestException('UNSUPPORTED_MIMETYPE')
    }
  }

  async onModuleDestroy() {
    await this.galleryPhotoValidationQueue.close()
  }

  private albumInfoForPhotoProcessing(albumId: string): Promise<GalleryAlbumEntity | null> {
    return this.albumRepository.findOne({
      where: { id: albumId },
      select: {
        id: true,
        uploadDirectory: true,
        minimumResolutionMp: true,
        takenAfter: true,
        takenBefore: true,
        watermarkPreset: true,
      },
    })
  }
}
