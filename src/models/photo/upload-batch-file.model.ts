import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { v4 as uuidv4 } from 'uuid'
import { toBuffer, toString } from 'uuid-buffer'
import { UploadBatchJobModel } from './upload-batch-job.model'

@modelOptions({ schemaOptions: { collection: 'batch.files' } })
export class UploadBatchFileModel {
  constructor(model?: Partial<UploadBatchFileModel>) {
    Object.assign(this, model)
  }

  @prop({ auto: true })
  _id?: Types.ObjectId = new Types.ObjectId()

  @prop({
    type: Buffer,
    subtype: 4,
    get: (_) => (_ ? toString(_) : _),
    set: toBuffer,
    default: () => toBuffer(uuidv4()),
    required: true,
  })
  uuid?: string | Buffer = uuidv4()

  @prop({ required: true, ref: () => UploadBatchJobModel })
  batch: Ref<UploadBatchJobModel>

  @prop({ required: true })
  directory: string

  @prop({ required: true })
  filename: string

  @prop()
  md5?: string

  @prop()
  width?: number

  @prop()
  height?: number

  @prop()
  orientation?: number

  @prop({ alias: 'takenTimestamp' })
  taken_timestamp?: Date

  takenTimestamp?: Date

  @prop()
  color?: string

  @prop({
    enum: UploadTaskBatchFileState,
    default: UploadTaskBatchFileState.ready,
  })
  state?: UploadTaskBatchFileState

  @prop()
  message?: string

  @prop({ default: false, select: false })
  deleted?: boolean

  isValidating() {
    return (
      this.state === UploadTaskBatchFileState.wait_for_validation || this.state === UploadTaskBatchFileState.validating
    )
  }

  isProcessing() {
    return (
      this.state === UploadTaskBatchFileState.wait_for_processing || this.state === UploadTaskBatchFileState.processing
    )
  }
}
