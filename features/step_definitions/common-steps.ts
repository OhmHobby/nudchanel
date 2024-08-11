import { binding, when } from 'cucumber-tsflow'
import { agent } from 'supertest'
import { Workspace } from './workspace'

@binding([Workspace])
export class CommonSteps {
  constructor(private readonly _workspace: Workspace) {}

  async httpRequest(method: string, endpoint?: string, query?: object, body?: object) {
    const test = agent(this._workspace.serverUrl)
    if (query) test.query(query)
    const requestEndpoint = endpoint ?? '/'
    Object.entries(this._workspace.requestHeaders).map(([k, v]) => test.set(k, v))
    for (let attempts = 3; attempts; attempts--) {
      if (method === 'GET') {
        this._workspace.response = await test.get(requestEndpoint).send()
      } else if (method === 'POST') {
        this._workspace.response = await test.post(requestEndpoint).send(body)
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
