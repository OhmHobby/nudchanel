import { SignAccessToken } from '@nudchannel/auth'
import config from 'config'
import { Config } from 'src/enums/config.enum'
import { TestData } from 'test/test-data'

export class AccessTokenBuilder {
  private readonly accessTokenSigner: SignAccessToken

  constructor() {
    const privateKey = config.get<string>(Config.NUDCH_TOKEN_PRIVATE_KEY)
    const issuer = config.get<string>(Config.NUDCH_TOKEN_ISSUER)
    this.accessTokenSigner = new SignAccessToken(issuer, privateKey)
    this.accessTokenSigner.setProfileId(TestData.aValidUserId.toHexString())
  }

  withGroups(groups: string[]) {
    this.accessTokenSigner.setGroups(groups)
    return this
  }

  build() {
    return this.accessTokenSigner.sign()
  }
}
