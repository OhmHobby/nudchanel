import { Controller, Get, Logger, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { YearTeamMemberDto } from '../dto/year-team-members.dto'
import { TeamMembersResponseModel } from '../models/team-members.response.model'
import { TeamService } from './team.service'

@Controller({ path: 'accounts/teams', version: '1' })
@ApiTags('TeamMemberV1')
export class TeamMemberV1Controller {
  private readonly logger = new Logger(TeamMemberV1Controller.name)

  constructor(private readonly teamService: TeamService) {}

  @Get(':year')
  @ApiOkResponse({ type: [TeamMembersResponseModel] })
  async listYearTeamMembers(@Param() { year }: YearTeamMemberDto): Promise<TeamMembersResponseModel[]> {
    const members = await this.teamService.getYearMembers(year)
    return members.map(TeamMembersResponseModel.fromModel)
  }
}
