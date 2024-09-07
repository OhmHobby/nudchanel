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

  findByIdPopulated(id: Types.ObjectId | string) {
    return this.profileModel.findById(id).populate({ path: 'names' }).exec()
  }

  findByGoogleId(googleId: string) {
    return this.profileModel.findOne({ google_ids: googleId }).exec()
  }

  findByDiscordId(discordId: string) {
    return this.profileModel.findOne({ discord_ids: discordId }).exec()
  }

  async findAllDiscordIds() {
    const docs = await this.profileModel.find().select('discord_ids').lean().exec()
    return docs.flatMap((el) => el.discord_ids ?? [])
  }

  async discordIdsFromEmails(emails: string[] = []): Promise<string[]> {
    const profiles = await this.profileModel.find({ emails: { $in: emails } }).exec()
    return profiles.flatMap((profile) => (profile.discord_ids ?? []).slice(0, 1))
  }

  create(profile: Partial<ProfileModel>): Promise<ProfileModel> {
    return this.profileModel.create(profile)
  }
}
