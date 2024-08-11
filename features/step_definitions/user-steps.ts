import { User } from '@nudchannel/auth'
import { before, binding, given } from 'cucumber-tsflow'
import { Workspace } from './workspace'

@binding([Workspace])
export class UserSteps {
  constructor(private readonly workspace: Workspace) {}

  @before()
  before() {
    this.workspace.user = new User()
  }

  @given(/^user profileId (.{24})$/)
  givenUserProfileId(profileId: string) {
    this.workspace.user.id = profileId
  }

  @given(/^user groups (.+)$/)
  givenUserGroups(groups: string) {
    this.workspace.user.groups = groups.split(/\s*,\s*/)
  }
}
