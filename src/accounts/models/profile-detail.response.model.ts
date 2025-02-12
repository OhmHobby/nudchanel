import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { isDocument } from '@typegoose/typegoose'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'

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

  static fromModel(name?: ProfileNameModel) {
    return new ProfileDetailResponseModel({
      profileId: (isDocument(name?.profile) ? name.profile._id : name?.profile)?.toHexString(),
      firstname: name?.firstname,
      lastname: name?.lastname,
      nickname: name?.nickname,
    })
  }

  static fromProfile(profile?: ProfileModel, lang: ProfileNameLanguage = 'en') {
    return ProfileDetailResponseModel.fromModel(profile?.populatedNames?.find((p) => p.lang === lang))
  }
}
