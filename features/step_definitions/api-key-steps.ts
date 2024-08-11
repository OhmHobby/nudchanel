import { binding, given, then } from 'cucumber-tsflow'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'
import expect from 'expect'

@binding([Workspace])
export class ApiKeySteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('API key {string}')
  givenApiKey(apiKey: string) {
    this.workspace.requestHeaders['x-api-key'] = apiKey
  }

  @then('API key service should be {string}')
  thenService(name: string) {
    expect(this.workspace.response?.body.service).toBe(name)
  }
}
