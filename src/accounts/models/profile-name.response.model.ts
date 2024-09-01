import { ApiPropertyOptional } from '@nestjs/swagger'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'

export class ProfileNameResponseModel {
  constructor(model?: Partial<ProfileNameResponseModel>) {
    Object.assign(this, model)
  }

  @ApiPropertyOptional()
  firstname?: string

  @ApiPropertyOptional()
  lastname?: string

  @ApiPropertyOptional()
  nickname?: string

  static fromModel(name?: ProfileNameModel) {
    return new ProfileNameResponseModel({
      firstname: name?.firstname,
      lastname: name?.lastname,
      nickname: name?.nickname,
    })
  }

  static fromProfile(profile?: ProfileModel, lang: ProfileNameLanguage = 'en') {
    return ProfileNameResponseModel.fromModel(profile?.populatedNames?.find((p) => p.lang === lang))
  }
}
