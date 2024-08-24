import { ProcessPhotoParams } from './process-photo-params'

export class AsyncProcessPhotoParams {
  constructor(object?: Partial<AsyncProcessPhotoParams>) {
    Object.assign(this, object)
  }

  source: string

  destination: string

  params: ProcessPhotoParams
}
