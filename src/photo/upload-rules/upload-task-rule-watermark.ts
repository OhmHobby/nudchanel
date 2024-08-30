import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

export class UploadTaskRuleWatermark extends UploadTaskRuleAbstract<string> {
  static readonly PATTERN = /^WM_(\d+)$/

  readonly pattern = UploadTaskRuleWatermark.PATTERN

  getValue() {
    if (this.rule) {
      return this.pattern.exec(this.rule)?.at(1) ?? null
    }
    return null
  }
}
