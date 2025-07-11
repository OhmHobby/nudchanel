import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { TestData } from 'test/test-data'

export class UserLocalBuilder {
  private readonly userLocal: UserLocalModel

  constructor() {
    this.userLocal = new UserLocalModel()
    this.userLocal.profile = TestData.aValidUserId
    this.userLocal.username = 'username'
    this.userLocal.password = '$argon2i$v=19$m=16,t=2,p=1$RG12dThTeUZDYmsyWVBQVw$3gh5x1Zn+A/C2GYGJGiX5Q' // nudchDev!123
    this.userLocal.disabled = false
  }

  withDisabled(disabled: boolean) {
    this.userLocal.disabled = disabled
    return this
  }

  build() {
    return this.userLocal
  }
}
