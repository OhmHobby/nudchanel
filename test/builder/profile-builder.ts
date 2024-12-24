import { ProfileModel } from 'src/models/accounts/profile.model'
import { TestData } from 'test/test-data'

export class ProfileBuilder {
  private readonly profile: ProfileModel

  constructor() {
    this.profile = new ProfileModel()
    this.profile._id = TestData.aValidUserId
  }

  build() {
    return this.profile
  }
}
