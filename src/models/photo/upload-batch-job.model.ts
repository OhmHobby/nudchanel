import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { UploadTaskBatchJobStatus } from 'src/enums/upload-task-batch-job-status.enum'
import { PhotoBatchId } from '../types'
import { UploadBatchFileModel } from './upload-batch-file.model'
import { UploadTaskModel } from './upload-task.model'

@modelOptions({ schemaOptions: { collection: 'batch.jobs' } })
export class UploadBatchJobModel {
  constructor(model?: Partial<UploadBatchJobModel>) {
    Object.assign(this, model)
  }

  @prop({ auto: true })
  _id?: PhotoBatchId

  @prop({ ref: () => UploadTaskModel })
  task?: Ref<UploadTaskModel>

  @prop()
  // photos are taken by whom
  owner?: Types.ObjectId

  @prop()
  // batch is created by whom
  creator: Types.ObjectId

  @prop({
    enum: UploadTaskBatchJobStatus,
    default: UploadTaskBatchJobStatus.ready,
  })
  status?: UploadTaskBatchJobStatus

  @prop({
    ref: () => UploadBatchFileModel,
    foreignField: 'batch',
    localField: '_id',
  })
  files?: Ref<UploadBatchFileModel>[]

  @prop({ default: false, select: false })
  deleted?: boolean
}
