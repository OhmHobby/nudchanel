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

  @given('change password using current password = {string}')
  givenCurrentPassword(password: string) {
    this.workspace.requestBody.currentPassword = password
  }

  @given('change password using new password = {string}')
  givenNewPassword(password: string) {
    this.workspace.requestBody.newPassword = password
  }

  @given('profile contact tels {string}')
  givenProfileContactTels(tels: string) {
    this.workspace.requestBody.tels = tels.split(',')
  }

  @given('profile contact emails {string}')
  givenProfileContactEmails(emails: string) {
    this.workspace.requestBody.emails = emails.split(',')
  }

  @then('profile photo id should be {string}')
  thenProfilePhotoId(id: string) {
    expect(this.workspace.response?.body.id).toBe(id)
  }

  @then('profile contact tels should be {string}')
  thenProfileContactTels(tels: string) {
    expect(this.workspace.response?.body.tels).toEqual(tels.split(','))
  }

  @then('profile contact emails should be {string}')
  thenProfileContactEmails(emails: string) {
    expect(this.workspace.response?.body.emails).toEqual(emails.split(','))
  }
}
