import { binding, then, when } from 'cucumber-tsflow'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'
import expect from 'expect'
import { HttpStatus } from '@nestjs/common'

@binding([Workspace])
export class DataMigrationSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @when('migrate data {string}')
  async whenMigrateData(name: string) {
    await this.httpRequest('POST', '/migrate/data/' + name)
    expect(this.workspace.response?.statusCode).toBe(HttpStatus.OK)
    for (let attempts = 30; attempts; attempts--) {
      process.stdout.write('.')
      if (await this.thenDataMigration(name)) return
      await this.whenDelay(1000)
    }
  }

  @then('data migration {string} should be success')
  async thenDataMigration(name: string) {
    await this.httpRequest('GET', '/migrate/data')
    expect(this.workspace.response?.statusCode).toBe(HttpStatus.OK)
    return this.workspace.response?.body.includes(name)
  }
}
