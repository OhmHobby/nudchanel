import { DataTable } from '@cucumber/cucumber'
import { binding, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class AlbumSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @then('albums should be')
  thenAlbumsShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body]
      .flat()
      .map((album) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(album[column]) }), {}))
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }

  @then('album activity should be')
  thenAlbumActivityShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body?.activity]
      .flat()
      .map((activity) =>
        columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(activity[column]) }), {}),
      )
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }
}
