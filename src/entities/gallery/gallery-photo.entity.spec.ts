import { GalleryPhotoNextState } from 'src/enums/gallery-photo-pending-state.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { uuidv4 } from 'uuidv7'
import { GalleryPhotoEntity } from './gallery-photo.entity'

describe(GalleryPhotoEntity.name, () => {
  describe('colorHex', () => {
    test('undefined', () => {
      const entity = new GalleryPhotoEntity()
      expect(entity.colorHex).toBe(undefined)
    })

    test('#000000', () => {
      const entity = new GalleryPhotoEntity({ color: 0 })
      expect(entity.colorHex).toBe('#000000')
    })

    test('#FFFFFF', () => {
      const entity = new GalleryPhotoEntity({ color: 16777215 })
      expect(entity.colorHex).toBe('#ffffff')
    })
  })

  describe('state / pendingState', () => {
    test('created', () => {
      const entity = new GalleryPhotoEntity()
      expect(entity.state).toBe(GalleryPhotoState.created)
      expect(entity.nextState).toBe(GalleryPhotoNextState.validation)
    })

    test('failed', () => {
      const entity = new GalleryPhotoEntity({ errorMessage: 'time-out' })
      expect(entity.state).toBe(GalleryPhotoState.failed)
      expect(entity.nextState).toBe(undefined)
    })

    describe('validated', () => {
      test('accepted', () => {
        const entity = new GalleryPhotoEntity({ validatedAt: new Date() })
        expect(entity.state).toBe(GalleryPhotoState.accepted)
        expect(entity.nextState).toBe(GalleryPhotoNextState.processing)
      })

      test('rejected', () => {
        const entity = new GalleryPhotoEntity({
          validatedAt: new Date(),
          rejectReason: GalleryPhotoRejectReason.timestamp,
        })
        expect(entity.state).toBe(GalleryPhotoState.rejected)
        expect(entity.nextState).toBe(undefined)
      })
    })

    describe('processed', () => {
      test('processed', () => {
        const entity = new GalleryPhotoEntity({ validatedAt: new Date(), processedAt: new Date() })
        expect(entity.state).toBe(GalleryPhotoState.processed)
        expect(entity.nextState).toBe(GalleryPhotoNextState.approval)
      })

      test('approved', () => {
        const entity = new GalleryPhotoEntity({
          validatedAt: new Date(),
          processedAt: new Date(),
          reviewedBy: uuidv4(),
        })
        expect(entity.state).toBe(GalleryPhotoState.approved)
        expect(entity.nextState).toBe(undefined)
      })

      test('rejected', () => {
        const entity = new GalleryPhotoEntity({
          validatedAt: new Date(),
          processedAt: new Date(),
          reviewedBy: uuidv4(),
          rejectReason: GalleryPhotoRejectReason.other,
          rejectMessage: 'Inappropriate',
        })
        expect(entity.state).toBe(GalleryPhotoState.rejected)
        expect(entity.nextState).toBe(undefined)
      })

      test('failed', () => {
        const entity = new GalleryPhotoEntity({ validatedAt: new Date(), errorMessage: 'No data' })
        expect(entity.state).toBe(GalleryPhotoState.failed)
        expect(entity.nextState).toBe(undefined)
      })
    })
  })
})
