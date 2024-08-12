import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'
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

  findByDiscordId(discordId: string) {
    return this.profileModel.findOne({ discord_ids: discordId }).exec()
  }

  findAllDiscordIds() {
    return this.profileModel
      .find({ discord_ids: { $exists: true, $ne: [] } })
      .select('discord_ids')
      .lean()
      .exec()
  }

  async discordIdsFromEmails(emails: string[] = []): Promise<string[]> {
    const profiles = await this.profileModel.find({ emails: { $in: emails } }).exec()
    return profiles.flatMap((profile) => (profile.discord_ids ?? []).slice(0, 1))
  }

  getPhotoUrl(photo?: string, extension = '.jpg'): string {
    const baseUrl = 'https://photos.nudchannel.com/profiles'
    return `${baseUrl}/${this.getPhotoWithFallbackUuid(photo)}${extension}`
  }

  getPhotoWithFallbackUuid(photo?: string) {
    return photo ?? DEFAULT_UUID
  }
}
