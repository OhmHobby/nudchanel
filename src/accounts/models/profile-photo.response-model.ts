import { ApiProperty } from '@nestjs/swagger'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'

export class ProfilePhotoResponseModel {
  constructor(model?: Partial<ProfilePhotoResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  profileId: string

  static fromEntity(entity: ProfilePhotoEntity) {
    return new ProfilePhotoResponseModel({
      id: entity.id,
      profileId: ObjectIdUuidConverter.toHexString(entity.profileId),
    })
  }
}
