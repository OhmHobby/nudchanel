import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'

@Injectable()
export class ProfileNameService {
  private readonly logger = new Logger(ProfileNameService.name)

  constructor(
    @InjectModel(ProfileNameModel)
    private readonly profileNameModel: ReturnModelType<typeof ProfileNameModel>,
  ) {}

  findProfile(search?: string, profileIds?: Types.ObjectId[]): Promise<Types.ObjectId[]> {
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
    return query.distinct('profile').exec() as Promise<Types.ObjectId[]>
  }

  async getFallbackProfileName(profileId: string | Types.ObjectId) {
    const profile = await this.profileNameModel.findOne({ profile: profileId }).exec()
    return profile ?? new ProfileNameModel()
  }

  async getProfileName(
    profileId: string | Types.ObjectId,
    language: ProfileNameLanguage = 'en',
  ): Promise<ProfileNameModel> {
    const profile = await this.profileNameModel.findOne({ profile: profileId, lang: language }).exec()

    return profile ?? this.getFallbackProfileName(profileId)
  }

  async getNickNameWithInitials(profileId: Types.ObjectId) {
    const name = await this.getProfileName(profileId, 'en')
    if (name?.lang !== 'en') return null
    const nicknameCased = this.casedName(name.nickname)
    const firstLetterOfFirstName = this.casedInitial(name.firstname)
    const firstLetterOfLastName = this.casedInitial(name.lastname)
    return nicknameCased + firstLetterOfFirstName + firstLetterOfLastName
  }

  async getNickNameWithFirstNameAndInitial(profileId: Types.ObjectId) {
    const maxLength = 32
    const name = await this.getProfileName(profileId, 'en')
    if (name?.lang !== 'en') return null
    const nicknameCased = this.casedName(name.nickname)
    const firstnameCased = this.casedName(name.firstname)
    const lastnameInitial = this.casedInitial(name.lastname)
    const trimmedFirstname = firstnameCased.slice(0, maxLength - `(${nicknameCased}) ${lastnameInitial}`.length)
    if (trimmedFirstname !== firstnameCased)
      this.logger.warn(`${profileId}: "${firstnameCased}" has trimmed to "${trimmedFirstname}"`)
    return `(${nicknameCased}) ${trimmedFirstname}${lastnameInitial}`
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
    profile: Types.ObjectId,
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
