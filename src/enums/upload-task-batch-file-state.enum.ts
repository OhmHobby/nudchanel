export enum UploadTaskBatchFileState {
  ready = 'ready',
  wait_for_validation = 'wait_for_validation',
  validating = 'validating',
  accepted = 'accepted',
  rejected = 'rejected',
  skipped = 'skipped',
  wait_for_processing = 'wait_for_processing',
  processing = 'processing',
  aborted = 'aborted',
  processed = 'processed',
  error = 'error',
}
