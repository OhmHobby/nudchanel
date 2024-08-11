import { InjectModel } from '@m8a/nestjs-typegoose'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, NotFoundException } from '@nestjs/common'
import {
  PhotoProcessorV1ControllerProcessFitEnum,
  PhotoProcessorV1ControllerProcessFormatEnum,
} from '@nudchannel/photo-processor'
import { ReturnModelType } from '@typegoose/typegoose'
import { Queue } from 'bull'
import { createHash } from 'crypto'
import { Types } from 'mongoose'
import { join } from 'path'
import { NAMESPACE_OID_UUID } from 'src/constants/uuid.constants'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoProfilePhotoModel } from 'src/models/photo/profile-photo'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'
import { PhotoProcesserV1Service } from 'src/photo/photo-processer.v1.service'
import { v5 as uuidv5 } from 'uuid'
import MUUID from 'uuid-mongodb'
import { UserLocalService } from '../user/user-local.service'
import { ProfileService } from './profile.service'

@Injectable()
export class ProfilePhotoService {
  constructor(
    @InjectModel(ProfilePhotoModel)
    private readonly profilePhotoModel: ReturnModelType<typeof ProfilePhotoModel>,
    @InjectModel(PhotoProfilePhotoModel)
    private readonly photoProfilePhotoModel: ReturnModelType<typeof PhotoProfilePhotoModel>,
    @InjectQueue(BullQueueName.Migration)
    private readonly migrationQueue: Queue,
    private readonly profileService: ProfileService,
    private readonly userLocalService: UserLocalService,
    private readonly photoProcessor: PhotoProcesserV1Service,
  ) {}

  async importFromNas(directory: string, filename: string, profileId: Types.ObjectId) {
    const [profile, user] = await Promise.all([
      this.profileService.findById(profileId),
      this.userLocalService.findByProfile(profileId),
    ])
    if (!profile) throw new NotFoundException('Profile not found')
    const path = this.getSrcFilepath(directory, filename)
    const md5Response = await this.photoProcessor.photoProcessorV1ControllerGetMd5(path)
    const uuid = this.generateUuidFromMd5HashString(md5Response.data.md5)
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
      await this.photoProcessor.photoProcessorV1ControllerProcessSync({
        path,
        destination: this.getProfilePath(uuid + '.webp'),
        format: PhotoProcessorV1ControllerProcessFormatEnum.Webp,
        width: 256,
        height: 256,
        fit: PhotoProcessorV1ControllerProcessFitEnum.Outside,
      }),
      await this.photoProcessor.photoProcessorV1ControllerProcessSync({
        path,
        destination: this.getProfilePath(uuid + '.jpg'),
        format: PhotoProcessorV1ControllerProcessFormatEnum.Jpeg,
        width: 128,
        height: 128,
        fit: PhotoProcessorV1ControllerProcessFitEnum.Outside,
      }),
      await this.processGravatar(path, username),
    ])
  }

  generateUuidFromMd5HashString(md5Hash: string) {
    return uuidv5(md5Hash, NAMESPACE_OID_UUID)
  }

  async processGravatar(path: string, username?: string) {
    if (!username) return
    const mailHash = createHash('sha256').update(`${username}@nudchannel.com`.trim().toLowerCase()).digest('hex')
    const destination = `minio://avatar/${mailHash}`
    await this.photoProcessor.photoProcessorV1ControllerProcessSync({
      path,
      destination,
      format: PhotoProcessorV1ControllerProcessFormatEnum.Jpeg,
      width: 256,
      height: 256,
      fit: PhotoProcessorV1ControllerProcessFitEnum.Outside,
    })
    return destination
  }

  getProfilePath(filename: string) {
    return `minio://profiles/${filename}`
  }

  getSrcFilepath(directory: string, filename: string) {
    return `webdav://${join(directory, filename)}`
  }

  async migrate() {
    const photos = await this.photoProfilePhotoModel.find().lean().exec()
    await this.migrationQueue.addBulk(
      photos.map((photo) => ({
        name: BullJobName.MigrateProfilePhoto,
        data: photo,
      })),
    )
  }
}
