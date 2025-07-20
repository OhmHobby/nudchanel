import { ExpandedUserSchema } from '@gitbeaker/rest'
import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { APIUser, Snowflake } from 'discord.js'
import { Span } from 'nestjs-otel'
import { ProfileDiscordEntity } from 'src/entities/accounts/profile-discord.entity'
import { ProfileGitlabEntity } from 'src/entities/accounts/profile-gitlab.entity'
import { Config } from 'src/enums/config.enum'
import { Encryption } from 'src/helpers/encryption'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileId } from 'src/models/types'
import { Repository } from 'typeorm'

@Injectable()
export class ProfileService extends Encryption {
  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: ReturnModelType<typeof ProfileModel>,
    @InjectRepository(ProfileDiscordEntity)
    private readonly profileDiscordRepository: Repository<ProfileDiscordEntity>,
    @InjectRepository(ProfileGitlabEntity)
    private readonly profileGitlabRepository: Repository<ProfileGitlabEntity>,
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
  findByDiscordId(discordId: Snowflake) {
    return this.profileDiscordRepository.findOne({ where: { id: discordId } })
  }

  @Span()
  async upsertDiscordProfile(discord: APIUser, profileId: ProfileId) {
    const profileUid = ObjectIdUuidConverter.toUuid(profileId)
    const discordProfile = await this.profileDiscordRepository.findOneBy({ id: discord.id })
    if (discordProfile) {
      return this.profileDiscordRepository.update(
        { id: discord.id },
        { avatar: discord.avatar, mfaEnabled: discord.mfa_enabled },
      )
    } else {
      const profileCount = await this.profileDiscordRepository.countBy({ profileId: profileUid })
      return this.profileDiscordRepository.create({
        id: discord.id,
        profileId: profileUid,
        avatar: discord.avatar,
        mfaEnabled: discord.mfa_enabled,
        rank: profileCount,
      })
    }
  }

  @Span()
  findByGitlabId(gitlabId: number) {
    return this.profileGitlabRepository.findOneBy({ id: gitlabId })
  }

  @Span()
  async upsertGitlabProfile(gitlab: ExpandedUserSchema, profileId: ProfileId) {
    const profileUid = ObjectIdUuidConverter.toUuid(profileId)
    const gitlabProfile = await this.profileGitlabRepository.findOneBy({ id: gitlab.id })
    if (gitlabProfile) {
      return this.profileGitlabRepository.update({ id: gitlab.id }, { mfaEnabled: gitlab.two_factor_enabled })
    } else {
      return this.profileGitlabRepository.create({
        id: gitlab.id,
        profileId: profileUid,
        mfaEnabled: gitlab.two_factor_enabled,
      })
    }
  }

  @Span()
  findByEmail(email: string) {
    return this.profileModel.findOne({ emails: email }).exec()
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

  async profileMap(profileIds: ProfileId[]): Promise<Map<string, ProfileModel>> {
    const profiles = await this.profileModel.find({ _id: { $in: profileIds } }).exec()
    return new Map(profiles.map((el) => [el._id.toString(), el]))
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
