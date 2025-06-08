import { RecruitOfferResponseEnum } from 'src/enums/recruit-offer-response.enum'
import { RecruitApplicantRoleEntity } from './recruit-applicant-role.entity'

describe(RecruitApplicantRoleEntity.name, () => {
  describe(RecruitApplicantRoleEntity.prototype.determineOfferResponse.name, () => {
    const now = new Date('2025-07-07T00:00:00.000Z')

    it('should return tba when no offer info', () => {
      const entity = new RecruitApplicantRoleEntity()
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.tba)
    })

    it('should return rejected when no offer', () => {
      const entity = new RecruitApplicantRoleEntity({ offerAccepted: false })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.rejected)
    })

    it('should return pending when offer has not response yet', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-08T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.pending)
    })

    it('should return declined when offer has exceed expiry', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return declined when offer has been declined', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerResponseAt: new Date(),
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-08T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return accepted when offer has been accpeted', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerResponseAt: new Date(),
        offerAccepted: true,
        offerExpireAt: new Date('2025-07-08T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.accepted)
    })
  })
})
