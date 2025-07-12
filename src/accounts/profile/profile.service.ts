import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import { Span } from 'nestjs-otel'
import { Config } from 'src/enums/config.enum'
import { Encryption } from 'src/helpers/encryption'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileId } from 'src/models/types'

@Injectable()
export class ProfileService extends Encryption {
  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
    configService: ConfigService,
  ) {
    super(configService.getOrThrow(Config.ENCRYPTION_KEY))
  }

  @Span()
  async findById(id: ProfileId, withContact = false) {
    const query = this.profileModel.findById(id)
    const result = await query.exec()
    if (!result) return null
    if (withContact && result.tels?.length) {
      result.tels = result.tels.map((el) => this.decrypt(el))
    } else result.tels = []
    return result
  }

  @Span()
  findByIdPopulated(id: ProfileId) {
    return this.profileModel.findById(id).populate({ path: 'names' }).exec()
  }

  @Span()
  findByGoogleId(googleId: string) {
    return this.profileModel.findOne({ google_ids: googleId }).exec()
  }

  @Span()
  findByDiscordId(discordId: string) {
    return this.profileModel.findOne({ discord_ids: discordId }).exec()
  }

  @Span()
  async findAllDiscordIds() {
    const docs = await this.profileModel.find().select('discord_ids').lean().exec()
    return docs.flatMap((el) => el.discord_ids ?? [])
  }

  @Span()
  async discordIdsFromEmails(emails: string[] = []): Promise<string[]> {
    const profiles = await this.profileModel.find({ emails: { $in: emails } }).exec()
    return profiles.flatMap((profile) => (profile.discord_ids ?? []).slice(0, 1))
  }

  @Span()
  async emailsFromProfileIds(profileIds: ProfileId[]): Promise<string[]> {
    const profiles = await this.profileModel
      .find({ _id: { $in: profileIds } })
      .select('emails')
      .lean()
      .exec()
    return profiles.flatMap((profile) => profile.emails ?? [])
  }

  @Span()
  create(profile: Partial<ProfileModel>): Promise<ProfileModel> {
    return this.profileModel.create(profile)
  }

  @Span()
  updateContactInfo(id: ProfileId, contactInfo: { emails?: string[]; tels?: string[] }): Promise<ProfileModel | null> {
    const updateData: Partial<ProfileModel> = {}

    if (contactInfo.emails !== undefined) {
      updateData.emails = contactInfo.emails
    }

    if (contactInfo.tels !== undefined) {
      updateData.tels = contactInfo.tels.map((el) => this.encrypt(el))
    }

    return this.profileModel.findByIdAndUpdate(id, updateData, { new: true }).exec()
  }
}
