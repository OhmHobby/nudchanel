import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryPhotoFlowState } from 'src/enums/gallery-photo-flow-state.enum'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'
import { GalleryAlbumPhotoModel } from './gallery-album-photo.model'

describe(GalleryAlbumPhotoModel.name, () => {
  describe('photo url', () => {
    it('should return undefined when processedAt is null', () => {
      const model = GalleryAlbumPhotoModel.fromEntity(new GalleryPhotoEntity({ id: DEFAULT_UUID }))
      expect(model.thumbnail).toBeUndefined()
      expect(model.preview).toBeUndefined()
    })

    it('should return photo url when state is processed', () => {
      const model = GalleryAlbumPhotoModel.fromEntity(
        new GalleryPhotoEntity({ id: DEFAULT_UUID, processedAt: new Date() }),
      )
      expect(model.thumbnail).toBe(
        'https://photos.nudchannel.com/photos/thumbnail/00000000-0000-0000-0000-000000000000.webp',
      )
      expect(model.preview).toBe(
        'https://photos.nudchannel.com/photos/preview/00000000-0000-0000-0000-000000000000.webp',
      )
    })
  })

  describe('flowProgress', () => {
    let entity: GalleryPhotoEntity
    let flowProgress: number
    const expectTrue = (state: GalleryPhotoFlowState) =>
      expect(GalleryPhotoFlowState[flowProgress & state]).toBe(GalleryPhotoFlowState[state])
    const expectFalse = (state: GalleryPhotoFlowState) =>
      expect(GalleryPhotoFlowState[flowProgress & state]).not.toBe(GalleryPhotoFlowState[state])

    beforeEach(() => {
      entity = new GalleryPhotoEntity({ id: DEFAULT_UUID, createdBy: DEFAULT_UUID })
      flowProgress = 0
    })

    test('unknown', () => {
      const model = GalleryAlbumPhotoModel.fromEntity(entity)
      expect(model.flowProgress).toBeUndefined()
    })

    describe('creation => _ => _ => _', () => {
      beforeEach(() => {
        entity.filename = 'test.jpg'
      })

      test('created', () => {
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.Failed)
        expectTrue(GalleryPhotoFlowState.Created)
        expectTrue(GalleryPhotoFlowState.ValidationPending)
      })

      test('failed', () => {
        entity.errorMessage = 'Something went wrong'
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectTrue(GalleryPhotoFlowState.Failed)
        expectFalse(GalleryPhotoFlowState.Created)
        expectFalse(GalleryPhotoFlowState.ValidationPending)
      })

      afterEach(() => {
        expect(flowProgress).toBeDefined()
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectFalse(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.Processing)
        expectFalse(GalleryPhotoFlowState.ProcessingFailed)
        expectFalse(GalleryPhotoFlowState.Processed)
        expectFalse(GalleryPhotoFlowState.ReviewPending)
        expectFalse(GalleryPhotoFlowState.ReviewRejected)
        expectFalse(GalleryPhotoFlowState.ReviewApproved)
      })
    })

    describe('created => validation => _ => _', () => {
      beforeEach(() => {
        entity.filename = 'test.jpg'
      })

      test('pending', () => {
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectTrue(GalleryPhotoFlowState.ValidationPending)
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectFalse(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.Processing)
      })

      test('failed', () => {
        entity.validatedAt = new Date()
        entity.errorMessage = 'Something went wrong'
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.ValidationPending)
        expectTrue(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectFalse(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.Processing)
      })

      test('rejected', () => {
        entity.validatedAt = new Date()
        entity.rejectReason = GalleryPhotoRejectReason.timestamp
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.ValidationPending)
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectTrue(GalleryPhotoFlowState.ValidationRejected)
        expectFalse(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.Processing)
      })

      test('accepted', () => {
        entity.validatedAt = new Date()
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.ValidationPending)
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectTrue(GalleryPhotoFlowState.ValidationAccepted)
        expectTrue(GalleryPhotoFlowState.Processing)
      })

      afterEach(() => {
        expect(flowProgress).toBeDefined()
        expectFalse(GalleryPhotoFlowState.Failed)
        expectTrue(GalleryPhotoFlowState.Created)
        expectFalse(GalleryPhotoFlowState.ProcessingFailed)
        expectFalse(GalleryPhotoFlowState.Processed)
        expectFalse(GalleryPhotoFlowState.ReviewPending)
        expectFalse(GalleryPhotoFlowState.ReviewRejected)
        expectFalse(GalleryPhotoFlowState.ReviewApproved)
      })
    })

    describe('created => validated => processing => _', () => {
      beforeEach(() => {
        entity.filename = 'test.jpg'
        entity.validatedAt = new Date()
      })

      test('pending', () => {
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectTrue(GalleryPhotoFlowState.Processing)
        expectFalse(GalleryPhotoFlowState.ProcessingFailed)
        expectFalse(GalleryPhotoFlowState.Processed)
        expectFalse(GalleryPhotoFlowState.ReviewPending)
      })

      test('failed', () => {
        entity.processedAt = new Date()
        entity.errorMessage = 'Something went wrong'
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.Processing)
        expectTrue(GalleryPhotoFlowState.ProcessingFailed)
        expectFalse(GalleryPhotoFlowState.Processed)
        expectFalse(GalleryPhotoFlowState.ReviewPending)
      })

      test('passed', () => {
        entity.processedAt = new Date()
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.Processing)
        expectFalse(GalleryPhotoFlowState.ProcessingFailed)
        expectTrue(GalleryPhotoFlowState.Processed)
        expectTrue(GalleryPhotoFlowState.ReviewPending)
      })

      afterEach(() => {
        expect(flowProgress).toBeDefined()
        expectFalse(GalleryPhotoFlowState.Failed)
        expectTrue(GalleryPhotoFlowState.Created)
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectTrue(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.ReviewRejected)
        expectFalse(GalleryPhotoFlowState.ReviewApproved)
      })
    })

    describe('created => validated => processed => approval', () => {
      beforeEach(() => {
        entity.filename = 'test.jpg'
        entity.validatedAt = new Date()
        entity.processedAt = new Date()
      })

      test('pending', () => {
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectTrue(GalleryPhotoFlowState.ReviewPending)
        expectFalse(GalleryPhotoFlowState.ReviewRejected)
        expectFalse(GalleryPhotoFlowState.ReviewApproved)
      })

      test('rejected', () => {
        entity.reviewedBy = DEFAULT_UUID
        entity.rejectReason = GalleryPhotoRejectReason.other
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.ReviewPending)
        expectTrue(GalleryPhotoFlowState.ReviewRejected)
        expectFalse(GalleryPhotoFlowState.ReviewApproved)
      })

      test('approved', () => {
        entity.reviewedBy = DEFAULT_UUID
        flowProgress = GalleryAlbumPhotoModel.fromEntity(entity).flowProgress!
        expectFalse(GalleryPhotoFlowState.ReviewPending)
        expectFalse(GalleryPhotoFlowState.ReviewRejected)
        expectTrue(GalleryPhotoFlowState.ReviewApproved)
      })

      afterEach(() => {
        expect(flowProgress).toBeDefined()
        expectFalse(GalleryPhotoFlowState.Failed)
        expectTrue(GalleryPhotoFlowState.Created)
        expectFalse(GalleryPhotoFlowState.ValidationFailed)
        expectFalse(GalleryPhotoFlowState.ValidationRejected)
        expectTrue(GalleryPhotoFlowState.ValidationAccepted)
        expectFalse(GalleryPhotoFlowState.Processing)
        expectFalse(GalleryPhotoFlowState.ProcessingFailed)
        expectTrue(GalleryPhotoFlowState.Processed)
      })
    })
  })
})
