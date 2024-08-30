import { binding, given, then } from 'cucumber-tsflow'
import expect from 'expect'
import sharp from 'sharp'
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

  @then('photo width should be {int}')
  thenWidth(width: number) {
    expect(this.workspace.response?.body?.width).toBe(width)
  }

  @then('photo height should be {int}')
  thenHeight(height: number) {
    expect(this.workspace.response?.body?.height).toBe(height)
  }

  @then('photo imageSize should be {int}x{int}')
  async thenSize(width: number, height: number) {
    const meta = await sharp(this.workspace.response?.body).metadata()
    expect(`${meta.width}x${meta.height}`).toBe(`${width}x${height}`)
  }

  @then(/^photo taken date should be (.+)$/)
  thenDate(date: string) {
    expect(this.workspace.response?.body?.date).toBe(date)
  }

  @then(/^photo orientation should be (.*)$/)
  thenOrientation(orientation: string) {
    expect(this.workspace.response?.body?.orientation).toBe(orientation ? +orientation : undefined)
  }
}
