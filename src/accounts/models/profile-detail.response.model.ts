import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { ProfileId } from 'src/models/types'

export class ProfileDetailResponseModel {
  constructor(model?: Partial<ProfileDetailResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  profileId: string

  @ApiPropertyOptional()
  firstname?: string

  @ApiPropertyOptional()
  lastname?: string

  @ApiPropertyOptional()
  nickname?: string

  static fromModel(profileId?: ProfileId, name?: ProfileNameModel) {
    return new ProfileDetailResponseModel({
      profileId: profileId?.toHexString(),
      firstname: name?.firstname,
      lastname: name?.lastname,
      nickname: name?.nickname,
    })
  }

  static fromProfile(profile?: ProfileModel, lang: ProfileNameLanguage = 'en') {
    return ProfileDetailResponseModel.fromModel(profile?._id, profile?.populatedNames?.find((p) => p.lang === lang))
  }
}
