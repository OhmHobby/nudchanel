import { DataTable } from '@cucumber/cucumber'
import { HttpStatus } from '@nestjs/common'
import config from 'config'
import { binding, given, then, when } from 'cucumber-tsflow'
import expect from 'expect'
import { basename } from 'path'
import { Config } from 'src/enums/config.enum'
import { GalleryAlbumPhotoModel } from 'src/gallery/dto/gallery-album-photo.model'
import { GalleryAlbumPhotosModel } from 'src/gallery/dto/gallery-album-photos.model'
import { MD5 } from 'src/helpers/md5.helper'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class AlbumPhotosSteps extends CommonSteps {
  private currentAlbumId: string

  private currentUploadPhoto: GalleryAlbumPhotoModel

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

  @when('upload gallery album {string} photo', undefined, 15000)
  async whenUpload(albumId: string) {
    await this.httpRequest('POST', `/api/v1/gallery/albums/${albumId}/photos/uploads`)
    this.currentAlbumId = albumId
    this.currentUploadPhoto = this.workspace.response?.body
  }

  @when('wait for current gallery upload photo to be {string} state', undefined, 30000)
  async whenWaitForFileIdToBeState(state: string) {
    const result = await this.whenWaitForPhotoToBeState(
      this.currentAlbumId,
      state,
      (el) => el.id === this.currentUploadPhoto.id,
    )
    expect(result).toBe(true)
  }

  @when('wait for gallery album {string} upload photo file {string} to be {string} state', undefined, 30000)
  async whenWaitForFileNameToBeState(album: string, filename: string, state: string) {
    const result = await this.whenWaitForPhotoToBeState(album, state, (el) => el.filename === filename)
    expect(result).toBe(true)
  }

  private async whenWaitForPhotoToBeState(album: string, state: string, filter: (photo) => boolean) {
    for (let attempt = 0; attempt++ < 10; await this.whenDelay(1000, '.')) {
      await this.httpRequest('GET', `/api/v1/gallery/albums/${album}/photos/uploads`, {
        takenBy: this.workspace.user.id,
      }).catch((err) => console.error(err))
      const { photos } = this.workspace.response?.body as GalleryAlbumPhotosModel
      const photo = photos.find(filter)
      const currentUploadPhoto = this.currentUploadPhoto.id
        ? photos.find((el) => (el.id = this.currentUploadPhoto.id))
        : undefined
      this.currentUploadPhoto = currentUploadPhoto ?? this.currentUploadPhoto
      if (photo?.state === state) return true
    }
    console.error(`Time out`, this.workspace.response?.body)
    return false
  }

  @then('gallery album photos should contain')
  thenPhotosShouldContain(dataTable: DataTable) {
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
        thumbnail: String(photo.thumbnail),
        preview: String(photo.preview),
        state: String(photo.state),
        directory: String(photo.directory),
        filename: String(photo.filename),
        md5: String(photo.md5),
        rejectReason: String(photo.rejectReason),
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
      rejectReason: row.rejectReason ?? expect.anything(),
    }))
    normalizedTable.map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }

  @then('gallery album photo contributors should contain')
  thenContributorsShouldContain(dataTable: DataTable) {
    const normalizedTable = dataTable.hashes().map((row) => ({
      profileId: row.profileId ?? expect.anything(),
      firstname: row.firstname ?? expect.anything(),
      lastname: row.lastname ?? expect.anything(),
    }))
    normalizedTable.map((row) =>
      expect(this.workspace.response?.body?.contributors).toContainEqual(expect.objectContaining(row)),
    )
  }

  @then('upload file {string} should be existed')
  async thenUploadFileShouldBeExisted(path: string) {
    await expect(this.workspace.webdavClient.isExist(path)).resolves.toBe(true)
  }

  @then('uploaded gallery photo photo processed size {string} should have md5 {string}')
  async thenProcessEtag(size: string, etag: string) {
    const fullpath = this.currentUploadPhoto[size]
    const endpoint = fullpath?.replace(config.get<string>(Config.HTTP_BASEURL_PHOTO), '')
    this.workspace.responseType = 'blob'
    await this.httpRequest('GET', endpoint, undefined, undefined, process.env.WORKER_URL)
    expect(this.workspace.response?.status).toBe(HttpStatus.OK)
    expect(MD5.fromBuffer(this.workspace.response?.body).hex).toBe(etag)
  }
}
