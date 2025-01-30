import dayjs from 'dayjs'
import 'dayjs/locale/th'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import { UploadTaskRuleAbstract } from './upload-task-rule.abstract'

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(localizedFormat)

export abstract class UploadTaskRuleTimeAbstract extends UploadTaskRuleAbstract<dayjs.Dayjs | undefined> {
  abstract readonly pattern: RegExp

  getValue(): dayjs.Dayjs | undefined {
    const parsed = this.pattern.exec(this.rule ?? '')?.at(1)
    return parsed ? dayjs.unix(+parsed) : undefined
  }

  toDayJs(date: Date) {
    return dayjs(date)
  }
}
