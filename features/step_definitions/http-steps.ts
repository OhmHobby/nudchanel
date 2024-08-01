import { HttpStatus } from '@nestjs/common'
import { binding, then, when } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class HttpSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @when(/^GET (.+)$/)
  async whenGet(endpoint: string) {
    return await this.httpRequest('GET', endpoint, this.workspace.requestQueries)
  }

  @then(/^HTTP response status should be (.+)$/)
  thenStatusCode(status: string) {
    expect(this.workspace.response?.status).toBe(HttpStatus[status])
  }

  @then('HTTP response text should be {string}')
  thenResponseText(text: string) {
    expect(this.workspace.response?.text).toBe(text)
  }
}
