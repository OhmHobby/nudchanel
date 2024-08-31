process.env.ALLOW_CONFIG_MUTATIONS = true.toString()

import { getModelToken, TypegooseModule } from '@m8a/nestjs-typegoose'
import { INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { TraceService } from 'nestjs-otel'
import sharp from 'sharp'
import { configuration } from 'src/configs/configuration'
import { TypegooseConfigBuilderService } from 'src/configs/typegoose.config'
import { Config } from 'src/enums/config.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { UploadTaskBatchFileState } from 'src/enums/upload-task-batch-file-state.enum'
import { UploadBatchFileModel } from 'src/models/photo/upload-batch-file.model'
import { UploadBatchJobModel } from 'src/models/photo/upload-batch-job.model'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { PhotoPath } from 'src/photo/models/photo-path.model'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { PhotoWatermarkService } from 'src/photo/processor/watermark.service'
import { PhotoStreamService } from 'src/photo/stream/photo-stream.service'
import { PhotoMinioStorageService } from 'src/storage/photo-minio-storage.service'
import { StorageService } from 'src/storage/storage.service'
import { WebdavStorageService } from 'src/storage/webdav-storage.service'
import { TestData } from 'test/test-data'

describe('Photo stream', () => {
  let app: INestApplication
  let photoStreamService: PhotoStreamService
  let configService: ConfigService
  let storageService: StorageService
  let uploadTaskModel: ReturnModelType<typeof UploadTaskModel>
  let uploadBatchJobModel: ReturnModelType<typeof UploadBatchJobModel>
  let uploadBatchFileModel: ReturnModelType<typeof UploadBatchFileModel>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Photo)),
        TypegooseModule.forFeature([UploadTaskModel, UploadBatchJobModel, UploadBatchFileModel], MongoConnection.Photo),
      ],
      providers: [
        PhotoStreamService,
        PhotoV1Service,
        PhotoProcessorService,
        PhotoWatermarkService,
        PhotoMinioStorageService,
        WebdavStorageService,
        StorageService,
        TraceService,
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
    photoStreamService = module.get(PhotoStreamService)
    storageService = module.get(StorageService)
    configService = module.get(ConfigService)
    uploadTaskModel = module.get(getModelToken(UploadTaskModel.name))
    uploadBatchJobModel = module.get(getModelToken(UploadBatchJobModel.name))
    uploadBatchFileModel = module.get(getModelToken(UploadBatchFileModel.name))
  })

  it('should be defined', () => {
    expect(photoStreamService).toBeDefined()
  })

  describe('reprocess from original', () => {
    let buffer: Buffer | null

    const uuid = 'a924f210-4bdc-4683-9fc6-08dc5de0525a'
    const target = `minio://preview/${uuid}.webp`

    const task = new UploadTaskModel({
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      album: 'it-pstream',
      src_directory: '/2022/[2022.02.02] WebDev CI',
      rules: [],
    })
    const batch = new UploadBatchJobModel({
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      task: task._id,
      creator: TestData.aValidUserId,
    })
    const file = new UploadBatchFileModel({
      uuid,
      batch: batch._id,
      directory: task.src_directory,
      filename: 'IMG_2669.jpg',
      state: UploadTaskBatchFileState.processed,
    })

    beforeAll(async () => {
      try {
        await storageService.removeFile(target)
      } catch (err) {}
      await uploadBatchFileModel.deleteOne({ uuid })
      await uploadBatchJobModel.deleteOne({ _id: batch._id })
      await uploadTaskModel.deleteOne({ _id: task._id })
      await uploadTaskModel.create(task)
      await uploadBatchJobModel.create(batch)
      await uploadBatchFileModel.create(file)
    })

    it('should reprocess correctly', async () => {
      const photoPath = new PhotoPath(PhotoSize.preview, uuid, ImageFormat.webp)
      configService.set(Config.PHOTO_STREAM_UPLOAD, true)
      buffer = await photoStreamService.tryOriginal(photoPath)
      expect(photoPath.isRequestASource).toBe(true)
      expect(photoPath.sourcePath).toBe(target)
      expect(buffer?.length).toBeGreaterThan(0)
    }, 30000)

    test('image size', async () => {
      await expect(sharp(buffer!).metadata()).resolves.toEqual(expect.objectContaining({ width: 2160, height: 1440 }))
    }, 30000)

    test('file should be existed', async () => {
      let result = false
      for (let attempts = 3; attempts && !result; attempts--) {
        result = await storageService.isExist(target)
        await new Promise<void>((r) => setTimeout(() => r(), 1000))
      }
      expect(result).toBe(true)
    }, 30000)
  })

  afterAll(() => {
    app.close()
  })
})
