import { Controller, Get, Logger, Param } from '@nestjs/common'
import { ApiBasicAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { UserCtx } from 'src/auth/user.decorator'
import { YearTeamMemberDto } from '../dto/year-team-members.dto'
import { TeamMembersResponseModel } from '../models/team-members.response.model'
import { TeamService } from './team.service'

@Controller({ path: 'accounts/teams', version: '1' })
@ApiTags('TeamMemberV1')
export class TeamMemberV1Controller {
  private readonly logger = new Logger(TeamMemberV1Controller.name)

  constructor(private readonly teamService: TeamService) {}

  @Get(':year')
  @ApiBasicAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: [TeamMembersResponseModel] })
  async listYearTeamMembers(
    @Param() { year }: YearTeamMemberDto,
    @UserCtx() user: User,
  ): Promise<TeamMembersResponseModel[]> {
    const members = await this.teamService.getYearMembers(year, user)
    return members.map(TeamMembersResponseModel.fromModel)
  }
}
