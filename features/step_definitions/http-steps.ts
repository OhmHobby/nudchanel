import { HttpStatus } from '@nestjs/common'
import { binding, given, then, when } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class HttpSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('request to worker url')
  givenTargetWorker() {
    this.workspace.serverUrl = process.env.WORKER_URL ?? 'http://127.0.0.1:5000'
  }

  @given(/^If none match (.*)$/)
  givenIfNonMatch(etag: string) {
    this.workspace.requestHeaders['if-none-match'] = etag
  }

  @given('HTTP response type {string}')
  givenResponseType(responseType: string) {
    this.workspace.responseType = responseType
  }

  @when(/^GET (.+)$/)
  async whenGet(endpoint: string) {
    return await this.httpRequest('GET', endpoint, this.workspace.requestQueries)
  }

  @when(/^POST (.+)$/, undefined, 15000)
  async whenPost(endpoint: string) {
    return await this.httpRequest('POST', endpoint, this.workspace.requestQueries, this.workspace.requestBody)
  }

  @when(/^PUT (.+)$/, undefined, 15000)
  async whenPut(endpoint: string) {
    return await this.httpRequest('PUT', endpoint, this.workspace.requestQueries, this.workspace.requestBody)
  }

  @then(/^HTTP response status should be (.+)$/)
  thenStatusCode(status: string) {
    expect(this.workspace.response?.status).toBe(HttpStatus[status])
  }

  @then('HTTP response text should be {string}')
  thenResponseText(text: string) {
    expect(this.workspace.response?.text).toBe(text)
  }

  @then('HTTP response size should be {int}')
  thenResponseSize(size: number) {
    expect(this.workspace.response?.body?.length).toBe(size)
  }

  @then('HTTP response header {string} should be {string}')
  thenResponseHeader(key: string, value: string) {
    expect(this.workspace.response?.headers).toEqual(expect.objectContaining({ [key]: value }))
  }

  @then('HTTP response redirect to be {string}')
  then(redirect: string) {
    expect(this.workspace.response?.headers.location).toBe(redirect)
  }

  @then(/^ETag should be (.+)$/)
  thenEtag(etag: string) {
    expect(this.workspace.response?.headers['etag']).toBe(etag)
  }
}
