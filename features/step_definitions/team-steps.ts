import { DataTable } from '@cucumber/cucumber'
import { binding, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class TeamSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @then('team members should contain')
  thenTeamMembersShouldContain(dataTable: DataTable) {
    const normalizedResponse = [this.workspace.response?.body].flat().map((member) => ({
      profileId: member.profileId,
      firstname: member.name.firstname?.trim(),
      lastname: member.name.lastname?.trim(),
      nickname: member.name.nickname?.trim(),
      roles: member.roles.join(', '),
      group: member.group,
      photoUrl: member.photoUrl,
      email: String(member.email),
    }))
    dataTable.hashes().map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }
}
