import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, NotFoundException } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { Span } from 'nestjs-otel'
import { join } from 'path'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { PhotoPath } from './models/photo-path.model'
import { UploadTaskRuleWatermark } from './upload-rules/upload-task-rule-watermark'

@Injectable()
export class PhotoV1Service {
  constructor(
    @InjectModel(UploadTaskModel)
    private readonly taskModel: ReturnModelType<typeof UploadTaskModel>,
    @InjectModel(UploadBatchJobModel)
    private readonly batchJobModel: ReturnModelType<typeof UploadBatchJobModel>,
    @InjectModel(UploadBatchFileModel)
    private readonly batchFileModel: ReturnModelType<typeof UploadBatchFileModel>,
  ) {}

  @Span()
  async getBatchProfilePairs(albumId: string): Promise<Map<Types.ObjectId, Types.ObjectId | undefined>> {
    const tasks = await this.taskModel.find({ album: albumId }).select('_id').lean().exec()
    const taskIds = tasks.map((el) => el._id)
    const batches = await this.batchJobModel
      .find({ task: { $in: taskIds }, deleted: false })
      .select(['_id', 'owner'])
      .lean()
      .exec()
    return new Map(batches.map((el) => [el._id, el.owner]))
  }

  @Span()
  async getBatchesProcessedPhotos(batchIds: Types.ObjectId[]): Promise<UploadBatchFileModel[]> {
    const photos = await this.batchFileModel
      .find({ batch: { $in: batchIds }, state: UploadTaskBatchFileState.processed, deleted: false })
      .sort({ taken_timestamp: 'asc', md5: 'asc' })
      .select(['_id', 'uuid', 'width', 'height', 'color', 'batch', 'md5', 'taken_timestamp'])
      .lean()
      .exec()
    return this.deduplicateSortedByTimestampFollowByMd5Photos(photos)
  }

  @Span()
  private deduplicateSortedByTimestampFollowByMd5Photos(files: UploadBatchFileModel[]) {
    return files.filter((value, index, array) => value.md5 !== array[index - 1]?.md5)
  }

  @Span()
  async getFileInfo(uuid: string) {
    const file = await this.batchFileModel.findOne({ uuid, deleted: false }).orFail().exec()
    const { batch } = <{ batch: DocumentType<UploadBatchJobModel> }>await file.populate('batch')
    const { task } = <{ task: DocumentType<UploadTaskModel> }>await batch.populate('task')
    return { task, batch, file }
  }

  @Span()
  async getFileReprocessPhotoPath(requestProcessPath: PhotoPath) {
    const { file, task } = await this.getFileInfo(requestProcessPath.uuid)
    if (file.state !== UploadTaskBatchFileState.processed) throw new NotFoundException()
    const processParams = new PhotoPath(
      requestProcessPath.size,
      requestProcessPath.uuid,
      requestProcessPath.format,
    ).buildProcessParams({ watermark: new UploadTaskRuleWatermark(task.rules).getValue() ?? undefined })
    return { filename: this.getOriginalSourceFullPath(file), processParams }
  }

  getOriginalSourceFullPath(file: Pick<UploadBatchFileModel, 'directory' | 'filename'>) {
    return `webdav://${join(file.directory, file.filename)}`
  }
}
