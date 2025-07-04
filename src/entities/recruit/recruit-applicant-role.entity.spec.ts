import { RecruitOfferResponseEnum } from 'src/enums/recruit-offer-response.enum'
import { RecruitApplicantRoleEntity } from './recruit-applicant-role.entity'

describe(RecruitApplicantRoleEntity.name, () => {
  describe(RecruitApplicantRoleEntity.prototype.determineOfferResponse.name, () => {
    const now = new Date('2025-07-07T00:00:00.000Z')

    it('should return tba when no offer info', () => {
      const entity = new RecruitApplicantRoleEntity()
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.tba)
    })

    it('should return tba when offerAccepted is false and no expiry or response', () => {
      const entity = new RecruitApplicantRoleEntity({ offerAccepted: false })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.tba)
    })

    it('should return accepted when offerAccepted is true', () => {
      const entity = new RecruitApplicantRoleEntity({ offerAccepted: true })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.accepted)
    })

    it('should return accepted when offerAccepted is true with response time', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: true,
        offerResponseAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.accepted)
    })

    it('should return declined when offerAccepted is false with response time', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerResponseAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return declined when offer has expired and offerAccepted is false', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return tba when offerAccepted is false, has expiry, and has not expired yet', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-08T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.tba)
    })

    it('should return declined when offerAccepted is false, no expiry, but has response time', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerResponseAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return declined when offerAccepted is false, has expiry, has response time, and has not expired yet', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerResponseAt: new Date('2025-07-06T00:00:00.000Z'),
        offerExpireAt: new Date('2025-07-08T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return declined when offerAccepted is false, has expiry, has response time, and has expired', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerResponseAt: new Date('2025-07-06T00:00:00.000Z'),
        offerExpireAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })

    it('should return declined when offerAccepted is false, has expiry, no response time, and has expired', () => {
      const entity = new RecruitApplicantRoleEntity({
        offerAccepted: false,
        offerExpireAt: new Date('2025-07-06T00:00:00.000Z'),
      })
      expect(entity.determineOfferResponse(now)).toBe(RecruitOfferResponseEnum.declined)
    })
  })
})
