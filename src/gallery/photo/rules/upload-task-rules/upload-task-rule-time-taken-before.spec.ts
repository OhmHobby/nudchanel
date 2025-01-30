import dayjs from 'dayjs'
import { UploadTaskRuleTimeTakenBefore } from './upload-task-rule-time-taken-before'

describe(UploadTaskRuleTimeTakenBefore.name, () => {
  describe('getValue', () => {
    it('should return undefined when no rule required', () => {
      const result = new UploadTaskRuleTimeTakenBefore().getValue()
      expect(result).toBe(undefined)
    })

    it('should return number when rule required', () => {
      const rules = ['TB_1644048904']
      const result = new UploadTaskRuleTimeTakenBefore(rules).getValue()
      expect(result?.unix()).toBe(1644048904)
    })
  })

  describe('isValid', () => {
    let validator: UploadTaskRuleTimeTakenBefore

    beforeEach(() => {
      validator = new UploadTaskRuleTimeTakenBefore()
      validator.getValue = jest.fn().mockReturnValue(dayjs('2022-01-31T00:00:00Z'))
    })

    it('should return true when met requirement', () => {
      validator.getValue = jest.fn().mockReturnValue(undefined)
      expect(validator.isValid(new Date())).toBe(true)
    })

    it('should return true when photo taken 7AM BKK stored as UTC', () => {
      const takenDate = new Date('2022-01-31T00:00:00Z')
      expect(validator.isValid(takenDate)).toBe(true)
    })

    it('should return false when photo taken BKK stored as UTC', () => {
      const takenDate = new Date('2022-01-31T00:00:01Z')
      expect(validator.isValid(takenDate)).toBe(false)
    })
  })
})
