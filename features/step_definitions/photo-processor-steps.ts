import { binding, given } from 'cucumber-tsflow'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class PhotoProcessorSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('process photo path {string}')
  givenPath(path: string) {
    this.workspace.requestQueries.path = path
  }

  @given('process photo format {string}')
  givenFormat(format: string) {
    this.workspace.requestQueries.format = format
  }

  @given('process photo width {string}')
  givenWidth(width: string) {
    this.workspace.requestQueries.width = width
  }

  @given('process photo height {string}')
  givenHeight(height: string) {
    this.workspace.requestQueries.height = height
  }

  @given('process photo quality {string}')
  givenQuality(quality: string) {
    this.workspace.requestQueries.quality = quality
  }

  @given('process photo fit {string}')
  givenFit(fit: string) {
    this.workspace.requestQueries.fit = fit
  }

  @given('process photo watermark {string}')
  givenWatermark(watermark: string) {
    this.workspace.requestQueries.watermark = watermark
  }
}
