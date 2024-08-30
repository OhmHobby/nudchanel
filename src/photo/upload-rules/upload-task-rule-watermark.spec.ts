import { UploadTaskRuleWatermark } from './upload-task-rule-watermark'

describe(UploadTaskRuleWatermark.name, () => {
  describe('getValue', () => {
    it('should return 01 for WM_01', () => {
      const result = new UploadTaskRuleWatermark(['WM_01']).getValue()
      expect(result).toBe('01')
    })

    it('should return null when no matches rules', () => {
      const result = new UploadTaskRuleWatermark().getValue()
      expect(result).toBe(null)
    })
  })

  describe('isValid', () => {
    it('should return true when need watermark', () => {
      const validator = new UploadTaskRuleWatermark(['WM_01'])
      expect(validator.isValid()).toBe(true)
    })

    it('should return false when no watermark', () => {
      const validator = new UploadTaskRuleWatermark()
      expect(validator.isValid()).toBe(false)
    })
  })
})
