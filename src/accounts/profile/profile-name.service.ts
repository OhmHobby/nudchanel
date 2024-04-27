import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'

@Injectable()
export class ProfileNameService {
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
    if (name?.lang !== 'en') {
      return null
    }
    const nickname = name?.nickname?.trim()
    const nicknameCased = nickname?.charAt(0)?.toUpperCase() ?? '' + nickname?.slice(1)?.toLowerCase() ?? ''
    const fisrtLetterOfFirstName = name?.firstname?.charAt(0).toUpperCase()
    const fisrtLetterOfLastName = name?.lastname?.charAt(0).toUpperCase()
    return nicknameCased + fisrtLetterOfFirstName + fisrtLetterOfLastName
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
