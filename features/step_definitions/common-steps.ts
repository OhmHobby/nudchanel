import { SignAccessToken } from '@nudchannel/auth'
import config from 'config'
import { binding, when } from 'cucumber-tsflow'
import { Config } from 'src/enums/config.enum'
import { agent } from 'supertest'
import { Workspace } from './workspace'

@binding([Workspace])
export class CommonSteps {
  constructor(private readonly _workspace: Workspace) {}

  async httpRequest(method: string, endpoint?: string, query?: object, body?: object) {
    const test = agent(this._workspace.serverUrl)
    if (query) test.query(query)
    if (this._workspace.user.id) {
      const privateKey = config.get<string>(Config.NUDCH_TOKEN_PRIVATE_KEY)
      const issuer = config.get<string>(Config.NUDCH_TOKEN_ISSUER)
      const accessTokenSigner = new SignAccessToken(issuer, privateKey)
      accessTokenSigner.setProfileId(this._workspace.user.id)
      accessTokenSigner.setGroups(this._workspace.user.groups)
      const accessToken = await accessTokenSigner.sign()
      test.set('Authorization', 'Bearer ' + accessToken)
    }
    const requestEndpoint = endpoint ?? '/'
    Object.entries(this._workspace.requestHeaders).map(([k, v]) => test.set(k, v))
    for (let attempts = 3; attempts; attempts--) {
      if (method === 'GET') {
        const getTest = test.get(requestEndpoint)
        if (this._workspace.responseType) getTest.responseType(this._workspace.responseType)
        this._workspace.response = await getTest.send()
      } else if (method === 'POST') {
        const request = test.post(requestEndpoint)
        const attach = this._workspace.requestAttach
        this._workspace.response = attach
          ? await request.attach(attach.name, attach.file, attach.filename)
          : await request.send(body)
      } else if (method === 'PUT') {
        this._workspace.response = await test.put(requestEndpoint).send(body)
      } else {
        throw new Error('Unknown method ' + method)
      }
      if (this._workspace.response?.statusCode < 500) break
      console.error(`Status: ${this._workspace.response?.statusCode} - ${attempts} attempt(s) left`)
    }
    return this._workspace.response
  }

  @when('delay {int}ms')
  whenDelay(delay: number) {
    return new Promise<void>((r) => setTimeout(() => r(), delay))
  }
}
