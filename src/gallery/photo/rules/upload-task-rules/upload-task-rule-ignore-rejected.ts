import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

export class UploadTaskRuleIgnoreRejected extends UploadTaskRuleAbstract {
  static readonly PATTERN = /^IGNORE_REJECTED$/

  readonly pattern = UploadTaskRuleIgnoreRejected.PATTERN
}
