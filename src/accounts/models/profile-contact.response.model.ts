import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProfileModel } from 'src/models/accounts/profile.model'

export class ProfileContactResponseModel {
  constructor(model?: Partial<ProfileContactResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  profileId: string

  @ApiPropertyOptional({ type: [String] })
  emails?: string[]

  @ApiPropertyOptional({ type: [String] })
  tels?: string[]

  static fromModel(profile?: ProfileModel): ProfileContactResponseModel {
    return new ProfileContactResponseModel({
      profileId: profile?._id.toString(),
      emails: profile?.emails?.slice(0, 1),
      tels: profile?.tels?.slice(0, 1),
    })
  }
}
