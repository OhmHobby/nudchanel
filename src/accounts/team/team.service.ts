import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { Span } from 'nestjs-otel'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'

@Injectable()
export class TeamService {
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

  @Span()
  async getYearMembers(year: number) {
    const members = await this.teamMemberModel
      .find({ year })
      .sort({ profile: 'asc' })
      .populate({ path: 'profile', populate: { path: 'names' }, select: ['names', 'photo'] })
      .populate({ path: 'roles', select: '-_id' })
      .populate({ path: 'group', select: '-_id' })
      .exec()
    members.sort(this.sortRoleComparator)
    members.sort(this.sortGroupComparator)
    return members
  }

  sortRoleComparator(memberA: TeamMemberModel, memberB: TeamMemberModel): number {
    return (<TeamRoleModel>memberA.roles[0]).rank - (<TeamRoleModel>memberB.roles[0]).rank
  }

  sortGroupComparator(memberA: TeamMemberModel, memberB: TeamMemberModel): number {
    return (<TeamGroupModel>memberA.group).rank - (<TeamGroupModel>memberB.group).rank
  }
}
