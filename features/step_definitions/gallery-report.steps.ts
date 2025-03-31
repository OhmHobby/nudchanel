import { binding, given, then } from 'cucumber-tsflow'
import { Workspace } from './workspace'
import { CommonSteps } from './common-steps'
import { DataTable } from '@cucumber/cucumber'
import expect from 'expect'
import { GalleryReportModel } from 'src/gallery/dto/gallery-report.model'

@binding([Workspace])
export class GalleryReportSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('create gallery report with reason {string}')
  givenCreateReportWithReason(title: string) {
    this.workspace.requestBody.reason = title
  }

  @given('create gallery report with photoId {string}')
  givenCreateReportWithPhotoId(photoId: string) {
    this.workspace.requestBody.photoId = photoId
  }

  @given('create gallery report with albumId {string}')
  givenCreateReportWithAlbumId(albumId: string) {
    this.workspace.requestBody.albumId = albumId
  }

  @given('create gallery report with email {string}')
  givenCreateReportWithEmail(email: string) {
    this.workspace.requestBody.email = email
  }

  @then('gallery report must contain')
  thenReportMustContain(dt: DataTable) {
    const record: Partial<Record<keyof GalleryReportModel, any>> = dt.hashes()[0]
    const body = this.workspace.response?.body ?? {}
    record.id = record.id ? +record.id : expect.anything()
    record.reason = record.reason ?? expect.anything()
    record.photoId = record.photoId ?? expect.anything()
    record.state = record.state ?? expect.anything()
    record.reportById = record.reportById ?? expect.anything()

    expect(body).toContainEqual(record)
  }
}
