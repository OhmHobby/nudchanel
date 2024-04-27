import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ProfileModel } from 'src/models/accounts/profile.model'

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
  ) {}

  findById(id: Types.ObjectId | string) {
    return this.profileModel.findById(id).exec()
  }

  async discordIdsFromEmails(emails: string[] = []): Promise<string[]> {
    const profiles = await this.profileModel.find({ emails }).exec()
    return profiles.flatMap((profile) => (profile.discord_ids ?? []).slice(0, 1))
  }

  getPhotoUrl(photo?: string, extension = '.jpg'): string {
    const baseUrl = 'https://photos.nudchannel.com/profiles'
    return `${baseUrl}/${this.getPhotoWithFallbackUuid(photo)}${extension}`
  }

  getPhotoWithFallbackUuid(photo?: string) {
    return photo ?? '00000000-0000-0000-0000-000000000000'
  }
}
