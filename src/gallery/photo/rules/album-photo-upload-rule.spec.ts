import dayjs from 'dayjs'
import { AlbumPhotoUploadRule } from './album-photo-upload-rule'

describe(AlbumPhotoUploadRule.name, () => {
  const emptyRule = new AlbumPhotoUploadRule({ noDuplication: false })
  const allRule = new AlbumPhotoUploadRule({
    noDuplication: true,
    minimumResoluionMp: 5,
    takenAfter: dayjs('2023-12-01T00:00:00Z'),
    takenBefore: dayjs('2023-12-02T00:00:00Z'),
    watermarkPreset: '01',
  })

  describe(AlbumPhotoUploadRule.prototype.isResolutionMetRequirement.name, () => {
    const PHOTO_12MP = 12000000

    it('should return true when no requirement', () => {
      const validator = new AlbumPhotoUploadRule()
      expect(validator.isResolutionMetRequirement(PHOTO_12MP)).toBe(true)
    })

    it('should return true when met requirement', () => {
      const validator = new AlbumPhotoUploadRule({ minimumResoluionMp: 12 })
      expect(validator.isResolutionMetRequirement(PHOTO_12MP)).toBe(true)
    })

    it('should return false when small than expected', () => {
      const validator = new AlbumPhotoUploadRule({ minimumResoluionMp: 18 })
      expect(validator.isResolutionMetRequirement(PHOTO_12MP)).toBe(false)
    })
  })

  describe(AlbumPhotoUploadRule.prototype.isTakenAfterDateMetRequirement.name, () => {
    it('should return true when no requirement', () => {
      const validator = new AlbumPhotoUploadRule()
      expect(validator.isTakenAfterDateMetRequirement(new Date())).toBe(true)
    })

    it('should return true when photo taken 7AM BKK stored as UTC', () => {
      const validator = new AlbumPhotoUploadRule({ takenAfter: dayjs('2022-01-31T00:00:00Z') })
      const takenDate = new Date('2022-01-31T00:00:00Z')
      expect(validator.isTakenAfterDateMetRequirement(takenDate)).toBe(true)
    })

    it('should return false when photo taken BKK stored as UTC', () => {
      const validator = new AlbumPhotoUploadRule({ takenAfter: dayjs('2022-01-31T00:00:00Z') })
      const takenDate = new Date('2022-01-30T23:59:59Z')
      expect(validator.isTakenAfterDateMetRequirement(takenDate)).toBe(false)
    })
  })

  describe(AlbumPhotoUploadRule.prototype.isTakenBeforeDateMetRequirement.name, () => {
    it('should return true when met requirement', () => {
      const validator = new AlbumPhotoUploadRule()
      expect(validator.isTakenBeforeDateMetRequirement(new Date())).toBe(true)
    })

    it('should return true when photo taken 7AM BKK stored as UTC', () => {
      const validator = new AlbumPhotoUploadRule({ takenBefore: dayjs('2022-01-31T00:00:00Z') })
      const takenDate = new Date('2022-01-31T00:00:00Z')
      expect(validator.isTakenBeforeDateMetRequirement(takenDate)).toBe(true)
    })

    it('should return false when photo taken BKK stored as UTC', () => {
      const validator = new AlbumPhotoUploadRule({ takenBefore: dayjs('2022-01-31T00:00:00Z') })
      const takenDate = new Date('2022-01-31T00:00:01Z')
      expect(validator.isTakenBeforeDateMetRequirement(takenDate)).toBe(false)
    })
  })

  describe('buffer', () => {
    it('should convert all rule correctly', () => {
      const buffer = allRule.toBuffer()
      const newRule = AlbumPhotoUploadRule.fromBuffer(buffer)
      expect(newRule?.minimumResoluionMp).toEqual(allRule.minimumResoluionMp)
      expect(newRule?.takenAfter).toEqual(allRule.takenAfter)
      expect(newRule?.takenBefore).toEqual(allRule.takenBefore)
      expect(newRule?.watermarkPreset).toEqual(allRule.watermarkPreset)
    })

    it('should convert empty rule correctly', () => {
      const buffer = emptyRule.toBuffer()
      const newRule = AlbumPhotoUploadRule.fromBuffer(buffer)
      expect(newRule?.minimumResoluionMp).toEqual(emptyRule.minimumResoluionMp)
      expect(newRule?.takenAfter).toEqual(emptyRule.takenAfter)
      expect(newRule?.takenBefore).toEqual(emptyRule.takenBefore)
      expect(newRule?.watermarkPreset).toEqual(emptyRule.watermarkPreset)
    })
  })

  describe('pattern', () => {
    it('should convert all rule correctly', () => {
      const rules = allRule.toPattern()
      const newRule = AlbumPhotoUploadRule.fromPattern(rules)
      expect(newRule).toEqual(allRule)
    })

    it('should convert empty rule correctly', () => {
      const rules = emptyRule.toPattern()
      const newRule = AlbumPhotoUploadRule.fromPattern(rules)
      expect(newRule).toEqual(emptyRule)
    })
  })
})
