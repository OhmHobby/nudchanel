import { DataTable } from '@cucumber/cucumber'
import { binding, given, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class ActivitySteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('activities before {string}')
  givenBefore(date: string) {
    this.workspace.requestQueries.before = date
  }

  @given('activities limit to {int}')
  givenLimit(limit: number) {
    this.workspace.requestQueries.limit = String(limit)
  }

  @given('activities year {int}')
  givenYear(year: number) {
    this.workspace.requestQueries.year = String(year)
  }

  @given('activities search {string}')
  givenSearch(search: number) {
    this.workspace.requestQueries.search = String(search)
  }

  @given('activities include unpublished')
  givenIncludeUnpublished() {
    this.workspace.requestQueries.all = 'true'
  }

  @given('activity id {string}')
  givenId(id: string) {
    this.workspace.requestQueries.activityId = id
  }

  @given('activity title {string}')
  givenTitle(title: string) {
    this.workspace.requestBody.title = title
  }

  @given('activity cover {string}')
  givenCover(cover: string) {
    this.workspace.requestBody.cover = cover
  }

  @given('activity time {string}')
  givenTime(time: string) {
    this.workspace.requestBody.time = time
  }

  @given(/activity tags (\[.+\])/)
  givenTags(tags: string) {
    this.workspace.requestBody.tags = JSON.parse(tags)
  }

  @given(/activity published (true|false)/)
  givenPublished(published: 'true' | 'false') {
    this.workspace.requestBody.published = published === 'true'
  }

  @then('activities should be')
  thenActivitiesShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body]
      .flat()
      .map(
        (activity) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(activity[column]) }), {}),
      )
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }

  @then('activity albums should be')
  thenActivityAlbumsShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body?.albums]
      .flat()
      .map((album) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(album[column]) }), {}))
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }

  @then('activity videos should be')
  thenActivityVideosShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body?.videos]
      .flat()
      .map((video) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(video[column]) }), {}))
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }
}
