import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
import { Auth, google } from 'googleapis'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class GoogleJwtClientService {
  private readonly logger = new Logger(GoogleJwtClientService.name)

  private readonly TOKEN_CACHE_KEY = 'google:client.token'

  private readonly TOKEN_CACHE_DURATION = 3000 // Token lives 60 mins -> store 50 mins

  protected readonly SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
  ]

  constructor(
    @Inject(CACHE_MANAGER)
    protected readonly cacheManager: Cache,
    protected readonly configService: ConfigService,
  ) {}

  createClient(): Auth.JWT {
    const serviceEmail = this.configService.get(Config.GAPIS_SERVICE_EMAIL)
    const keyFile = undefined
    const servicePrivateKey = this.configService.get(Config.GAPIS_SERVICE_PRIVATEKEY)
    return new google.auth.JWT(serviceEmail, keyFile, servicePrivateKey, this.SCOPES)
  }

  async cacheToken(token: Auth.Credentials) {
    await this.cacheManager.set(this.TOKEN_CACHE_KEY, token, this.TOKEN_CACHE_DURATION)
  }

  async getClient(): Promise<Auth.OAuth2Client> {
    const client = this.createClient()
    const cachedToken = await this.cacheManager.get(this.TOKEN_CACHE_KEY)

    if (cachedToken) {
      client.credentials = cachedToken
      this.logger.verbose('Restored client credentials')
    } else {
      const token = await client.authorize()
      await this.cacheToken(token)
      this.logger.verbose('New client credentials')
    }

    return client
  }
}
