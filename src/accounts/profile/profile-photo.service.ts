import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, NotFoundException, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { createHash } from 'crypto'
import { join } from 'path'
import { DEFAULT_UUID, NAMESPACE_OID_UUID } from 'src/constants/uuid.constants'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileId } from 'src/models/types'
import { ProfilePhotoPath } from 'src/photo/models/profile-photo-path.model'
import { AsyncProcessPhotoParams } from 'src/photo/processor/async-process-photo-params'
import { StorageService } from 'src/storage/storage.service'
import { Repository } from 'typeorm'
import { v5 as uuidv5 } from 'uuid'
import { ProfileService } from './profile.service'

@Injectable()
export class ProfilePhotoService implements OnModuleDestroy {
  private readonly logger = new Logger(ProfilePhotoService.name)

  constructor(
    @InjectRepository(ProfilePhotoEntity)
    private readonly profilePhotoRepository: Repository<ProfilePhotoEntity>,
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
    @InjectQueue(BullQueueName.Photo)
    private readonly processPhotoQueue: Queue<AsyncProcessPhotoParams>,
  ) {}

  findByUuid(uuid: string) {
    return this.profilePhotoRepository.findOneBy({ id: uuid })
  }

  async importFromNas(directory: string, filename: string, profileId: ProfileId) {
    const profile = await this.profileService.findById(profileId)
    if (!profile) throw new NotFoundException('Profile not found')
    const path = this.getSrcFilepath(directory, filename)
    const md5 = await this.storageService.getFileMd5(path)
    const uuid = this.generateUuidFromMd5HashString(md5)
    await this.processProfilePhoto(path, uuid, profile.emails?.at(0))
    profile.photo = uuid
    const profilePhoto = new ProfilePhotoEntity({
      id: uuid,
      profileId: ObjectIdUuidConverter.toUuid(profileId),
      directory,
      filename,
    })
    await Promise.all([await profilePhoto.save(), await profile.save()])
    return profilePhoto
  }

  async processProfilePhoto(path: string, uuid: string, email?: string) {
    const webpPath = new ProfilePhotoPath(uuid, ImageFormat.webp)
    const jpegPath = new ProfilePhotoPath(uuid, ImageFormat.jpeg)
    await Promise.all([
      this.processPhoto(
        new AsyncProcessPhotoParams({
          source: path,
          destination: webpPath.path,
          params: webpPath.buildProcessParams(),
        }),
      ),
      this.processPhoto(
        new AsyncProcessPhotoParams({
          source: path,
          destination: jpegPath.path,
          params: jpegPath.buildProcessParams(),
        }),
      ),
      this.processGravatar(path, email),
    ])
  }

  generateUuidFromMd5HashString(md5Hash: string) {
    return uuidv5(md5Hash, NAMESPACE_OID_UUID)
  }

  async processPhoto(data: AsyncProcessPhotoParams) {
    await this.processPhotoQueue.add(BullJobName.PhotoProcess, data)
  }

  async processGravatar(path: string, email?: string) {
    if (!email) return
    const mailHash = createHash('sha256').update(`${email}`.trim().toLowerCase()).digest('hex')
    const destination = `minio://avatar/${mailHash}`
    const processParams = new ProfilePhotoPath(undefined, ImageFormat.webp).buildProcessParams({
      format: ImageFormat.jpeg,
    })
    await this.processPhoto(
      new AsyncProcessPhotoParams({
        source: path,
        destination,
        params: processParams,
      }),
    )
    return destination
  }

  getSrcFilepath(directory: string, filename: string) {
    return `webdav://${join(directory, filename)}`
  }

  getPhotoBuffer(uuid: string = DEFAULT_UUID, format: ImageFormat): Promise<Buffer> {
    const file = new ProfilePhotoPath(uuid, format).path
    return this.storageService.getBuffer(file)
  }

  async onModuleDestroy() {
    await this.processPhotoQueue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
