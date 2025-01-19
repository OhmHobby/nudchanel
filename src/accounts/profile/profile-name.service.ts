import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Span } from 'nestjs-otel'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { ProfileId } from 'src/models/types'
import { TeamService } from '../team/team.service'

@Injectable()
export class ProfileNameService {
  private readonly logger = new Logger(ProfileNameService.name)

  constructor(
    @InjectModel(ProfileNameModel)
    private readonly profileNameModel: ReturnModelType<typeof ProfileNameModel>,
    private readonly profileTeamService: TeamService,
  ) {}

  findProfile(search?: string, profileIds?: ProfileId[]): Promise<ProfileId[]> {
    const query = this.profileNameModel.find()
    if (search) {
      query.or([
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
      ])
    }
    if (profileIds?.length) {
      query.where({ profile: { $in: profileIds } })
    }
    return query.distinct('profile').exec() as Promise<ProfileId[]>
  }

  async getFallbackProfileName(profileId: ProfileId) {
    const profile = await this.profileNameModel.findOne({ profile: profileId }).exec()
    return profile ?? new ProfileNameModel()
  }

  async getProfileName(profileId: ProfileId, language: ProfileNameLanguage = 'en'): Promise<ProfileNameModel> {
    const profile = await this.profileNameModel.findOne({ profile: profileId, lang: language }).exec()

    return profile ?? this.getFallbackProfileName(profileId)
  }

  async getProfilesName(profileIds: ProfileId[], language: ProfileNameLanguage = 'en'): Promise<ProfileNameModel[]> {
    const profiles = await this.profileNameModel.find({ profile: { $in: profileIds }, lang: language }).exec()
    return profiles
  }

  @Span()
  async getProfilesNameMap(
    profileIds: ProfileId[],
    language: ProfileNameLanguage = 'en',
  ): Promise<Map<String, ProfileNameModel>> {
    const profiles = await this.getProfilesName(profileIds, language)
    return new Map(profiles.map((el) => [el.profile.toString(), el]))
  }

  async getNickNameWithInitials(profileId: ProfileId) {
    const name = await this.getProfileName(profileId, 'en')
    if (name?.lang !== 'en') return null
    const nicknameCased = this.casedName(name.nickname)
    const firstLetterOfFirstName = this.casedInitial(name.firstname)
    const firstLetterOfLastName = this.casedInitial(name.lastname)
    return nicknameCased + firstLetterOfFirstName + firstLetterOfLastName
  }

  async getNickNameWithFirstNameAndInitial(profileId: ProfileId) {
    const maxLength = 32
    const name = await this.getProfileName(profileId, 'en')
    if (name?.lang !== 'en') return null
    const nicknameCased = this.casedName(name.nickname)
    const firstnameCased = this.casedName(name.firstname)
    const lastnameInitial = this.casedInitial(name.lastname)
    const preRenderWithoutFirstname = this.getNameWithSecondaryNameInParenthesisPrefix(nicknameCased, lastnameInitial)
    const trimmedFirstname = firstnameCased.slice(0, maxLength - preRenderWithoutFirstname.length)
    if (trimmedFirstname !== firstnameCased)
      this.logger.warn(`${profileId}: "${firstnameCased}" has trimmed to "${trimmedFirstname}"`)
    return this.getNameWithSecondaryNameInParenthesisPrefix(nicknameCased, `${trimmedFirstname}${lastnameInitial}`)
  }

  async getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(profileId: ProfileId) {
    const maxLength = 32
    const [name, emoji] = await Promise.all([
      this.getProfileName(profileId, 'en'),
      this.profileTeamService.getLatestProfileTeamEmoji(profileId),
    ])
    if (name?.lang !== 'en') return null
    const nicknameCased = this.casedName(name.nickname)
    const firstnameCased = this.casedName(name.firstname)
    const lastnameInitial = this.casedInitial(name.lastname)
    const preRenderWithoutFirstname = emoji
      ? this.getNameWithSecondaryInParenthesisAndEmojiPrefix(emoji, nicknameCased, lastnameInitial)
      : this.getNameWithSecondaryNameInParenthesisPrefix(nicknameCased, lastnameInitial)
    const trimmedFirstname = firstnameCased.slice(0, maxLength - preRenderWithoutFirstname.length)
    if (trimmedFirstname !== firstnameCased)
      this.logger.warn(`${profileId}: "${firstnameCased}" has trimmed to "${trimmedFirstname}"`)
    const firstNameWithInitial = `${trimmedFirstname}${lastnameInitial}`
    return emoji
      ? this.getNameWithSecondaryInParenthesisAndEmojiPrefix(emoji, nicknameCased, firstNameWithInitial)
      : this.getNameWithSecondaryNameInParenthesisPrefix(nicknameCased, firstNameWithInitial)
  }

  private getNameWithSecondaryNameInParenthesisPrefix(secondaryName: string, primaryName: string) {
    return `(${secondaryName}) ${primaryName}`
  }

  private getNameWithSecondaryInParenthesisAndEmojiPrefix(emoji: string, secondaryName: string, primaryName: string) {
    return `${emoji} ${this.getNameWithSecondaryNameInParenthesisPrefix(secondaryName, primaryName)}`
  }

  private casedName(name = '') {
    const trimmedName = name.trim()
    const casedName = trimmedName?.charAt(0).toUpperCase() + trimmedName?.slice(1).toLowerCase()
    return casedName
  }

  private casedInitial(name = '') {
    return name.charAt(0).toUpperCase()
  }

  upsert(
    lang: ProfileNameLanguage,
    profile: ProfileId,
    name: Pick<ProfileNameModel, 'firstname' | 'lastname' | 'nickname' | 'title'>,
  ): Promise<ProfileNameModel> {
    return this.profileNameModel
      .findOneAndUpdate(
        {
          lang,
          profile,
        },
        {
          ...name,
          lang,
          profile,
        },
        { new: true, upsert: true },
      )
      .exec()
  }
}
