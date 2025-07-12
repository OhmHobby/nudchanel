import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { User } from '@nudchannel/auth'
import { ReturnModelType } from '@typegoose/typegoose'
import { Span } from 'nestjs-otel'
import { TeamGroupModel } from 'src/models/accounts/team-group.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { ProfileId } from 'src/models/types'

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamMemberModel)
    private readonly teamMemberModel: ReturnModelType<typeof TeamMemberModel>,
    @InjectModel(TeamRoleModel)
    private readonly teamRoleModel: ReturnModelType<typeof TeamRoleModel>,
    @InjectModel(TeamGroupModel)
    private readonly teamGroupModel: ReturnModelType<typeof TeamGroupModel>,
  ) {}

  @Span()
  async getLatestProfilePrimaryTeam(profileId: ProfileId): Promise<TeamRoleModel | undefined> {
    const teamMember = await this.teamMemberModel
      .find({ profile: profileId })
      .sort({ year: 'desc' })
      .populate('roles')
      .select('roles')
      .exec()
    const teamRole = teamMember.flatMap((el) => el.roles as TeamRoleModel[]).find((el) => el.emoji)
    return teamRole
  }

  @Span()
  async getLatestProfileTeamEmoji(profileId: ProfileId): Promise<string | undefined> {
    const teamRole = await this.getLatestProfilePrimaryTeam(profileId)
    return teamRole?.emoji
  }

  @Span()
  async getProfilePrimaryTeams(profileId: ProfileId) {
    const profileTeams = await this.teamMemberModel
      .find({ profile: profileId })
      .sort({ year: 'desc' })
      .populate('roles')
      .populate('group')
      .exec()
    return profileTeams.filter((el) => el.populatedGroup?.rank === 0)
  }

  @Span()
  async getYearMembers(year: number, user?: User) {
    const members = await this.teamMemberModel
      .find({ year })
      .sort({ profile: 'asc' })
      .populate({
        path: 'profile',
        populate: { path: 'names' },
        select: ['_id', 'names', 'photo'].concat(user?.isAuthorizedToGroups(`nudch_${year}`) ? ['emails'] : []),
      })
      .populate({ path: 'roles', select: '-_id' })
      .populate({ path: 'group', select: '-_id' })
      .exec()
    members.sort(this.sortRoleComparator)
    members.sort(this.sortGroupComparator)
    return members
  }

  @Span()
  async getPrimaryTeamRoles() {
    const roles = await this.teamRoleModel.find({ emoji: { $exists: true } }).exec()
    return roles.sort((a, b) => a.rank - b.rank)
  }

  @Span()
  async getPrimaryTeamYears(): Promise<number[]> {
    const primaryGroup = await this.teamGroupModel.findOne({ rank: 0 }).exec()
    const years = await this.teamMemberModel.find({ group: primaryGroup?._id }).distinct('year').exec()
    return years
  }

  sortRoleComparator(memberA: TeamMemberModel, memberB: TeamMemberModel): number {
    return (<TeamRoleModel>memberA.roles[0]).rank - (<TeamRoleModel>memberB.roles[0]).rank
  }

  sortGroupComparator(memberA: TeamMemberModel, memberB: TeamMemberModel): number {
    return (<TeamGroupModel>memberA.group).rank - (<TeamGroupModel>memberB.group).rank
  }
}
