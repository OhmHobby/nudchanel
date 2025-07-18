import { HttpStatus } from '@nestjs/common'
import { binding, given, then, when } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class ThrottlerSteps extends CommonSteps {
  private requestResults: Array<{ status: number; timestamp: number }> = []

  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('I am making requests to test rate limiting')
  givenRateLimitingTest() {
    this.requestResults = []
  }

  @when(/^I make (\d+) GET requests to (.+) within (\d+) second/)
  async whenMakeMultipleRequests(count: number, endpoint: string, seconds: number) {
    const requests: Array<Promise<{ status: number; timestamp: number }>> = []
    const startTime = Date.now()

    for (let i = 0; i < count; i++) {
      requests.push(this.makeSingleRequest('GET', endpoint))
    }

    const results = await Promise.all(requests)
    const endTime = Date.now()

    const actualTime = (endTime - startTime) / 1000
    expect(actualTime).toBeLessThanOrEqual(seconds)

    this.requestResults = results
  }

  @when(/^I make (\d+) additional GET request to (.+)/)
  async whenMakeAdditionalRequest(count: number, endpoint: string) {
    const result = await this.makeSingleRequest('GET', endpoint)
    this.requestResults.push(result)
  }

  @when('I wait for {float} seconds')
  async whenWait(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }

  @then('all {int} requests should return OK status')
  thenAllRequestsOk(count: number) {
    expect(this.requestResults).toHaveLength(count)
    this.requestResults.forEach((result) => {
      expect(result.status).toBe(HttpStatus.OK)
    })
  }

  @then('the {int}th request should return TOO_MANY_REQUESTS status')
  thenNthRequestTooManyRequests(n: number) {
    expect(this.requestResults).toHaveLength(n)
    const lastResult = this.requestResults[this.requestResults.length - 1]
    expect(lastResult.status).toBe(HttpStatus.TOO_MANY_REQUESTS)
  }

  @then('the request should return OK status')
  thenRequestOk() {
    expect(this.requestResults.at(-1)?.status).toBe(HttpStatus.OK)
  }

  private async makeSingleRequest(method: string, endpoint: string): Promise<{ status: number; timestamp: number }> {
    try {
      const response = await this.httpRequest(method, endpoint)
      return {
        status: response?.statusCode || 0,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        status: (error as any)?.response?.status || 500,
        timestamp: Date.now(),
      }
    }
  }
}
