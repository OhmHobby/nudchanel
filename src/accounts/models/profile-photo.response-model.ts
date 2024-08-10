import { ApiProperty } from '@nestjs/swagger'
import { ProfilePhotoModel } from 'src/models/profile-photo.model'

export class ProfilePhotoResponseModel {
  constructor(model?: Partial<ProfilePhotoResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  profileId: string

  static fromModel(model: ProfilePhotoModel) {
    return new ProfilePhotoResponseModel({
      id: model._id.toString(),
      profileId: model.profile.toString(),
    })
  }
}
