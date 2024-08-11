import { binding, given, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class ProfileSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('profile photo directory {string}')
  givenDirectory(directory: string) {
    this.workspace.requestBody.directory = directory
  }

  @given('profile photo filename {string}')
  givenFile(filename: string) {
    this.workspace.requestBody.filename = filename
  }

  @then('profile photo id should be {string}')
  thenProfilePhotoId(id: string) {
    expect(this.workspace.response?.body.id).toBe(id)
  }
}
