import { binding, given, then } from 'cucumber-tsflow'
import { Workspace } from './workspace'
import { CommonSteps } from './common-steps'
import { DataTable } from '@cucumber/cucumber'
import except from 'expect'
import { GalleryReportModel } from 'src/gallery/dto/gallery-report.model'

@binding([Workspace])
export class GalleryReportSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('create gallery report with title {string}')
  givenCreateReportWithTitle(title: string) {
    this.workspace.requestBody.title = title
  }

  @given('create gallery report with description {string}')
  givenCreateReportWithDescription(description: string) {
    this.workspace.requestBody.description = description
  }

  @given('create gallery report with photoId {string}')
  givenCreateReportWithPhotoId(photoId: string) {
    this.workspace.requestBody.photoId = photoId
  }

  @then('gallery report must contain')
  thenReportMustContain(dt: DataTable) {
    const record: Partial<Record<keyof GalleryReportModel, any>> = dt.hashes()[0]
    const body = this.workspace.response?.body ?? {}
    record.id = record.id ? +record.id : expect.anything()
    record.title = record.title ?? expect.anything()
    record.description = record.description ?? expect.anything()
    record.photoId = record.photoId ?? expect.anything()
    record.state = record.state ?? expect.anything()
    record.reportById = record.reportById ?? expect.anything()
    except(body).toContainEqual(record)
  }
}
