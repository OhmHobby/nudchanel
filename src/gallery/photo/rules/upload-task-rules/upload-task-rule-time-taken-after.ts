import { UploadTaskRuleTimeAbstract } from './upload-task-rule-time.abstract'

export class UploadTaskRuleTimeTakenAfter extends UploadTaskRuleTimeAbstract {
  static readonly PATTERN = /^TA_(\d+)$/

  readonly pattern = UploadTaskRuleTimeTakenAfter.PATTERN

  isValid(takenDate: Date) {
    const mustTakenAfterTime = this.getValue()
    if (!mustTakenAfterTime) {
      return true
    }
    const metRequirement = this.toDayJs(takenDate).isSameOrAfter(mustTakenAfterTime)
    return metRequirement
  }
}
