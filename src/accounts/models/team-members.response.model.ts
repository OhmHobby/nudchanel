import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { PhotoUrlHelper } from 'src/helpers/photo-url.helper'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { ProfileNameResponseModel } from './profile-name.response.model'

export class TeamMembersResponseModel {
  constructor(model?: Partial<TeamMembersResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  profileId: string

  @ApiProperty({ type: ProfileNameResponseModel })
  name: ProfileNameResponseModel

  @Exclude()
  photo: string

  @ApiProperty({ type: String })
  @Expose()
  get photoUrl() {
    return PhotoUrlHelper.profileWebp(this.photo)
  }

  @ApiProperty()
  roles: string[]

  @ApiProperty()
  group: string

  static fromModel(member: TeamMemberModel) {
    return new TeamMembersResponseModel({
      profileId: member.profile._id.toHexString(),
      name: ProfileNameResponseModel.fromProfile(member.populatedProfile),
      photo: member.populatedProfile?.photo,
      roles: member.roles.map((role) => (role as TeamRoleModel)?.name),
      group: (member.group as TeamGroupModel)?.name,
    })
  }
}
