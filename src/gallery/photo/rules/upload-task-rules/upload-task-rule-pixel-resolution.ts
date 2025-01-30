import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

export class UploadTaskRulePixelResolution extends UploadTaskRuleAbstract<number | undefined> {
  static readonly PATTERN = /^PX_(\d+)MP$/

  readonly pattern = UploadTaskRulePixelResolution.PATTERN

  getValue() {
    const parsed = this.rule && this.pattern.exec(this.rule)?.at(1)
    return parsed ? parseInt(parsed) : undefined
  }

  isValid(photoResolution: number) {
    const MEGA_PIXEL = 1000000
    const resolutionRequirement = this.getValue() ?? 0
    const minimumResolution = resolutionRequirement * MEGA_PIXEL
    const isResolutionMetRequirement = photoResolution >= minimumResolution
    return isResolutionMetRequirement
  }
}
