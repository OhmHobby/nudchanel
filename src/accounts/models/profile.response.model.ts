import { ApiProperty } from '@nestjs/swagger'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameResponseModel } from './profile-name.response.model'

export class ProfileResponseModel {
  constructor(model?: Partial<ProfileResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  name: ProfileNameResponseModel

  @ApiProperty()
  localName: ProfileNameResponseModel

  static fromModel(profile?: ProfileModel) {
    return new ProfileResponseModel({
      id: profile?._id.toString(),
      name: ProfileNameResponseModel.fromProfile(profile, 'en'),
      localName: ProfileNameResponseModel.fromProfile(profile, 'th'),
    })
  }
}
