import { UploadTaskRuleTimeAbstract } from './upload-task-rule-time.abstract'

export class UploadTaskRuleTimeTakenBefore extends UploadTaskRuleTimeAbstract {
  static readonly PATTERN = /^TB_(\d+)$/

  readonly pattern = UploadTaskRuleTimeTakenBefore.PATTERN

  isValid(takenDate: Date) {
    const mustTakenBeforeTime = this.getValue()
    if (!mustTakenBeforeTime) {
      return true
    }
    const metRequirement = this.toDayJs(takenDate).isSameOrBefore(mustTakenBeforeTime)
    return metRequirement
  }
}
