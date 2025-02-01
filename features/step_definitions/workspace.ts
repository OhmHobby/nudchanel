import { ConfigService } from '@nestjs/config'
import { SignAccessToken, User } from '@nudchannel/auth'
import config from 'config'
import { before, binding } from 'cucumber-tsflow'
import { WebdavStorageService } from 'src/storage/webdav-storage.service'
import * as request from 'supertest'

@binding()
export class Workspace {
  private readonly configService = new ConfigService({ ...config })

  serverUrl: string

  signAccessToken: SignAccessToken

  user: User

  requestQueries: Record<string, string>

  requestHeaders: Record<string, string>

  requestBody: Record<string, any>

  requestAttach?: { name: string; file: Buffer; filename: string }

  responseType?: string

  response: request.Response | null

  _webdavClient: WebdavStorageService

  get webdavClient() {
    if (!this._webdavClient) this._webdavClient = new WebdavStorageService(this.configService)
    return this._webdavClient
  }

  @before()
  before() {
    this.serverUrl = process.env.SERVER_URL || 'http://127.0.0.1:4000'
    this.response = null
    this.requestQueries = {}
    this.requestHeaders = {}
    this.requestBody = {}
    this.requestAttach = undefined
    this.responseType = undefined
  }
}
