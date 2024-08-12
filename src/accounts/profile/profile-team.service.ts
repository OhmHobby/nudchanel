import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'

@Injectable()
export class ProfileTeamService {
  constructor(
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: ReturnModelType<typeof TeamMemberModel>,
  ) {}

  async getLatestProfileTeamEmoji(profileId: Types.ObjectId): Promise<string | undefined> {
    const teamMember = await this.teamMemberModel
      .find({ profile: profileId })
      .sort({ year: 'desc' })
      .populate('roles')
      .select('roles')
      .exec()
    const emoji = teamMember.flatMap((el) => el.roles as TeamRoleModel[]).find((el) => el.emoji)?.emoji
    return emoji
  }
}
