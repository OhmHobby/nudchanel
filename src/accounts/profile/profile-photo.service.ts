import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Queue } from 'bull'
import { createHash } from 'crypto'
import { Types } from 'mongoose'
import { join } from 'path'
import { NAMESPACE_OID_UUID } from 'src/constants/uuid.constants'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { AsyncProcessPhotoParams } from 'src/photo/processor/async-process-photo-params'
import { ProcessPhotoParams } from 'src/photo/processor/process-photo-params'
import { StorageService } from 'src/storage/storage.service'
import { v5 as uuidv5 } from 'uuid'
import MUUID from 'uuid-mongodb'
import { UserLocalService } from '../user/user-local.service'
import { ProfileService } from './profile.service'

@Injectable()
export class ProfilePhotoService {
  constructor(
    @InjectModel(ProfilePhotoModel)
    private readonly profilePhotoModel: ReturnModelType<typeof ProfilePhotoModel>,
    private readonly profileService: ProfileService,
    private readonly userLocalService: UserLocalService,
    private readonly storageService: StorageService,
    @InjectQueue(BullQueueName.Photo)
    private readonly processPhotoQueue: Queue<AsyncProcessPhotoParams>,
  ) {}

  async importFromNas(directory: string, filename: string, profileId: Types.ObjectId) {
    const [profile, user] = await Promise.all([
      this.profileService.findById(profileId),
      this.userLocalService.findByProfile(profileId),
    ])
    if (!profile) throw new NotFoundException('Profile not found')
    const path = this.getSrcFilepath(directory, filename)
    const md5 = await this.storageService.getFileMd5(path)
    const uuid = this.generateUuidFromMd5HashString(md5)
    const muuid = MUUID.from(uuid)
    await this.processProfilePhoto(path, uuid, user?.username)
    profile.photo = uuid
    const [profilePhoto] = await Promise.all([
      await this.profilePhotoModel.findByIdAndUpdate(
        muuid,
        {
          _id: muuid,
          profile,
          directory,
          filename,
        },
        { upsert: true, new: true },
      ),
      await profile.save(),
    ])
    return profilePhoto
  }

  async processProfilePhoto(path: string, uuid: string, username?: string) {
    await Promise.all([
      this.processPhoto(
        new AsyncProcessPhotoParams({
          source: path,
          destination: this.getProfilePath(uuid + '.webp'),
          params: new ProcessPhotoParams({
            format: ImageFormat.webp,
            width: 256,
            height: 256,
            fit: ImageFit.outside,
          }),
        }),
      ),
      this.processPhoto(
        new AsyncProcessPhotoParams({
          source: path,
          destination: this.getProfilePath(uuid + '.jpg'),
          params: new ProcessPhotoParams({
            format: ImageFormat.jpeg,
            width: 128,
            height: 128,
            fit: ImageFit.outside,
          }),
        }),
      ),
      this.processGravatar(path, username),
    ])
  }

  generateUuidFromMd5HashString(md5Hash: string) {
    return uuidv5(md5Hash, NAMESPACE_OID_UUID)
  }

  async processPhoto(data: AsyncProcessPhotoParams) {
    const job = await this.processPhotoQueue.add(BullJobName.PhotoProcess, data)
    await job.finished()
  }

  async processGravatar(path: string, username?: string) {
    if (!username) return
    const mailHash = createHash('sha256').update(`${username}@nudchannel.com`.trim().toLowerCase()).digest('hex')
    const destination = `minio://avatar/${mailHash}`
    await this.processPhoto(
      new AsyncProcessPhotoParams({
        source: path,
        destination,
        params: new ProcessPhotoParams({
          format: ImageFormat.jpeg,
          width: 256,
          height: 256,
          fit: ImageFit.outside,
        }),
      }),
    )
    return destination
  }

  getProfilePath(filename: string) {
    return `minio://profiles/${filename}`
  }

  getSrcFilepath(directory: string, filename: string) {
    return `webdav://${join(directory, filename)}`
  }
}
