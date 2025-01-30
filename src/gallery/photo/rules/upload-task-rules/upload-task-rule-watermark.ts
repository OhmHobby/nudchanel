import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

export class UploadTaskRuleWatermark extends UploadTaskRuleAbstract<string | undefined> {
  static readonly PATTERN = /^WM_(\d+)$/

  readonly pattern = UploadTaskRuleWatermark.PATTERN

  getValue() {
    return this.rule ? this.pattern.exec(this.rule)?.at(1) : undefined
  }
}
