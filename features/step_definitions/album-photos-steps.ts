import { DataTable } from '@cucumber/cucumber'
import { binding, given, then } from 'cucumber-tsflow'
import expect from 'expect'
import { basename } from 'path'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class AlbumPhotosSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('upload file from {string}')
  async givenUploadFileFrom(objectName: string) {
    const buffer = await this.workspace.webdavClient.getBuffer(objectName)
    this.workspace.requestAttach = {
      name: 'file',
      file: buffer,
      filename: basename(objectName),
    }
  }

  @given('import album photos from directory {string}')
  givenImportPhotosFromDirectory(directory: string) {
    this.workspace.requestBody.directory = directory
  }

  @given('import album photos are taken by {string}')
  givenImportPhotosTakenBy(takenBy: string) {
    this.workspace.requestBody.takenBy = takenBy
  }

  @then('gallery album photos should contain')
  photosShouldContain(dataTable: DataTable) {
    const normalizedResponse = [this.workspace.response?.body?.photos ?? this.workspace.response?.body]
      .flat()
      .filter((photo) => dataTable.hashes().some((row) => !row.id || row.id === photo.id))
      .map((photo) => ({
        id: photo.id,
        uuid: photo.uuid,
        width: String(photo.width),
        height: String(photo.height),
        timestamp: String(photo.timestamp),
        color: String(photo.color),
        takenByProfileId: photo.takenBy?.profileId ?? '',
        takenByFirstname: photo.takenBy?.firstname ?? '',
        takenByLastname: photo.takenBy?.lastname ?? '',
        thumbnail: photo.thumbnail,
        preview: photo.preview,
        state: String(photo.state),
        directory: String(photo.directory),
        filename: String(photo.filename),
        md5: String(photo.md5),
      }))
    const normalizedTable = dataTable.hashes().map((row) => ({
      id: row.id ?? expect.anything(),
      uuid: row.uuid ?? expect.anything(),
      width: row.width ?? expect.anything(),
      height: row.height ?? expect.anything(),
      timestamp: row.timestamp ?? expect.anything(),
      color: row.color ?? expect.anything(),
      takenByProfileId: row['takenBy.profileId'] ?? expect.anything(),
      takenByFirstname: row['takenBy.firstname'] ?? expect.anything(),
      takenByLastname: row['takenBy.lastname'] ?? expect.anything(),
      thumbnail: row.thumbnail ?? expect.anything(),
      preview: row.preview ?? expect.anything(),
      state: row.state ?? expect.anything(),
      directory: row.directory ?? expect.anything(),
      filename: row.filename ?? expect.anything(),
      md5: row.md5 ?? expect.anything(),
    }))
    normalizedTable.map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }

  @then('upload file {string} should be existed')
  async thenUploadFileShouldBeExisted(path: string) {
    await expect(this.workspace.webdavClient.isExist(path)).resolves.toBe(true)
  }
}
