export class SupertestCookiesBuilder {
  private readonly cookies: string[]

  constructor() {
    this.cookies = []
  }

  withAccessToken(accessToken: string) {
    this.cookies.push(`access_token=${accessToken}`)
    return this
  }

  withRefreshToken(refreshToken: string) {
    this.cookies.push(`refresh_token=${refreshToken}`)
    return this
  }

  build() {
    return this.cookies
  }
}
