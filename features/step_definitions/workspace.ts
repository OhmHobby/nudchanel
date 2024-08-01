import { User } from '@nudchannel/auth'
import { before, binding } from 'cucumber-tsflow'
import * as request from 'supertest'

@binding()
export class Workspace {
  readonly serverUrl: string = process.env.SERVER_URL || 'http://127.0.0.1:4000'

  user: User

  requestQueries: Record<string, string>

  response: request.Response | null

  @before()
  before() {
    this.response = null
    this.requestQueries = {}
  }
}
