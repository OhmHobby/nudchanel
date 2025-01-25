import { SignAccessToken, User } from '@nudchannel/auth'
import { before, binding } from 'cucumber-tsflow'
import * as request from 'supertest'

@binding()
export class Workspace {
  serverUrl: string

  signAccessToken: SignAccessToken

  user: User

  requestQueries: Record<string, string>

  requestHeaders: Record<string, string>

  requestBody: Record<string, any>

  responseType?: string

  response: request.Response | null

  @before()
  before() {
    this.serverUrl = process.env.SERVER_URL || 'http://127.0.0.1:4000'
    this.response = null
    this.requestQueries = {}
    this.requestHeaders = {}
    this.requestBody = {}
    this.responseType = undefined
  }
}
