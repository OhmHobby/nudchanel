import { RecruitInterviewSlotModel } from './recruit-interview-slot.model'

describe(RecruitInterviewSlotModel.name, () => {
  describe('toRefId', () => {
    it('should convert to refId correctly (minute granuarity)', () => {
      const result = new RecruitInterviewSlotModel({
        start: new Date('2024-07-29T15:00:00.000Z'),
        end: new Date('2024-07-29T15:01:00.000Z'),
      }).refId
      expect(result).toBe('h38h0-h38h1')
    })

    it('should ignore seconds (minute granuarity)', () => {
      const result = new RecruitInterviewSlotModel({
        start: new Date('2024-07-29T15:00:59.999Z'),
        end: new Date('2024-07-29T15:01:59.999Z'),
      }).refId
      expect(result).toBe('h38h0-h38h1')
    })
  })

  describe('fromRefId', () => {
    it('should convert back date range correctly', () => {
      const result = RecruitInterviewSlotModel.fromRefId('h38h0-h38h1')
      expect(result.start).toEqual(new Date('2024-07-29T15:00:00.000Z'))
      expect(result.end).toEqual(new Date('2024-07-29T15:01:00.000Z'))
    })
  })
})
