export abstract class ExternalOidcUser<T = any> {
  protected static clientId: string

  protected static clientSecret: string

  static redirectUri?: string

  abstract generateSignInUrl(): string

  abstract getProviderUser(code: string): Promise<T>

  static setupClient(clientId: string, clientSecret: string, redirectUri?: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri
  }
}
