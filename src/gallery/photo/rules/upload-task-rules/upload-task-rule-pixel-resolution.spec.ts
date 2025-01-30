import { UploadTaskRulePixelResolution } from './upload-task-rule-pixel-resolution'

describe(UploadTaskRulePixelResolution.name, () => {
  describe('getValue', () => {
    it('should return 12 for PX_12MP', () => {
      const result = new UploadTaskRulePixelResolution(['PX_12MP']).getValue()
      expect(result).toBe(12)
    })

    it('should return undefined when no matches rules', () => {
      const result = new UploadTaskRulePixelResolution(['PX_XMP']).getValue()
      expect(result).toBe(undefined)
    })
  })

  describe('isValid', () => {
    const PHOTO_12MP = 12000000

    it('should return true when no requirement', () => {
      const validator = new UploadTaskRulePixelResolution()
      expect(validator.isValid(PHOTO_12MP)).toBe(true)
    })

    it('should return true when met requirement', () => {
      const validator = new UploadTaskRulePixelResolution(['PX_12MP'])
      expect(validator.isValid(PHOTO_12MP)).toBe(true)
    })

    it('should return false when small than expected', () => {
      const validator = new UploadTaskRulePixelResolution(['PX_18MP'])
      expect(validator.isValid(PHOTO_12MP)).toBe(false)
    })
  })
})
