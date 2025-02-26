/* eslint-disable @typescript-eslint/no-magic-numbers */
export enum GalleryPhotoFlowState {
  Unknown = 0,
  Failed = 1,
  Created = 1 << 1,
  ValidationPending = 1 << 2,
  ValidationFailed = 1 << 3,
  ValidationRejected = 1 << 4,
  ValidationAccepted = 1 << 5,
  Processing = 1 << 6,
  ProcessingFailed = 1 << 7,
  Processed = 1 << 8,
  ReviewPending = 1 << 9,
  ReviewRejected = 1 << 10,
  ReviewApproved = 1 << 11,
}
