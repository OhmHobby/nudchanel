import { DataTable } from '@cucumber/cucumber'
import { binding, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class AlbumPhotosSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @then('gallery album photos should contain')
  photosShouldContain(dataTable: DataTable) {
    const normalizedResponse = [this.workspace.response?.body?.photos]
      .flat()
      .filter((photo) => dataTable.hashes().some((row) => row.id === photo.id))
      .map((photo) => ({
        id: photo.id,
        uuid: photo.uuid,
        width: String(photo.width),
        height: String(photo.height),
        timestamp: String(photo.timestamp),
        color: photo.color,
        takenByProfileId: photo.takenBy?.profileId ?? '',
        takenByFirstname: photo.takenBy?.firstname ?? '',
        takenByLastname: photo.takenBy?.lastname ?? '',
        thumbnail: photo.thumbnail,
        preview: photo.preview,
      }))
    const normalizedTable = dataTable.hashes().map((row) => ({
      id: row.id,
      uuid: row.uuid,
      width: row.width,
      height: row.height,
      timestamp: row.timestamp,
      color: row.color,
      takenByProfileId: row['takenBy.profileId'],
      takenByFirstname: row['takenBy.firstname'],
      takenByLastname: row['takenBy.lastname'],
      thumbnail: row.thumbnail,
      preview: row.preview,
    }))
    normalizedTable.map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }
}
