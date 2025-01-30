import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

export class UploadTaskRuleNoDuplication extends UploadTaskRuleAbstract {
  static readonly PATTERN = /^NO_DUP$/

  readonly pattern = UploadTaskRuleNoDuplication.PATTERN
}
