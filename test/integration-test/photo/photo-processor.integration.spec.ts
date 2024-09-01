import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ImageFormat as ImageFormatProto } from '@nudchannel/protobuf/dist/image_format'
import { ProcessPhoto } from '@nudchannel/protobuf/dist/process_photo'
import { ResizeFit } from '@nudchannel/protobuf/dist/sharp_resize_fit'
import { TraceService } from 'nestjs-otel'
import { AmqpLifecyclesService } from 'src/amqp/amqp.life-cycles.service'
import { AmqpService } from 'src/amqp/amqp.service'
import { configuration } from 'src/configs/configuration'
import { RabbitMQConfigService } from 'src/configs/rabbitmq.config'
import { Config } from 'src/enums/config.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { PhotoConsumerService } from 'src/photo/photo-consumer.service'
import { PhotoMetadataService } from 'src/photo/processor/photo-metadata.service'
import { PhotoProcessorService } from 'src/photo/processor/photo-processor.service'
import { ProcessPhotoParams } from 'src/photo/processor/process-photo-params'
import { PhotoWatermarkService } from 'src/photo/processor/watermark.service'
import { PhotoMinioStorageService } from 'src/storage/photo-minio-storage.service'
import { StorageService } from 'src/storage/storage.service'
import { WebdavStorageService } from 'src/storage/webdav-storage.service'

describe('Photo processor', () => {
  let app: INestApplication
  let amqpService: AmqpService
  let storageService: StorageService
  let processorService: PhotoProcessorService
  let resultFromSync: Buffer
  let resultFromAsync: Buffer

  const source = 'webdav://2022/[2022.02.02] WebDev CI/IMG_2669.jpg'
  const destination = 'minio://preview/3957ba4e-b178-4869-a320-ef5550b78ce0.jpg'

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useClass: RabbitMQConfigService,
        }),
      ],
      providers: [
        PhotoConsumerService,
        PhotoProcessorService,
        PhotoWatermarkService,
        PhotoMetadataService,
        PhotoMinioStorageService,
        WebdavStorageService,
        StorageService,
        AmqpService,
        TraceService,
        AmqpLifecyclesService,
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
    amqpService = app.get(AmqpService)
    storageService = app.get(StorageService)
    processorService = app.get(PhotoProcessorService)
  }, +configuration()[Config.RABBITMQ_WAIT_TIMEOUT])

  it('should be defined', () => {
    expect(amqpService.amqpConnection).toBeDefined()
  })

  it('should process sync correctly', async () => {
    const buffer = await storageService.getBuffer(source)
    resultFromSync = await processorService.process(
      buffer,
      new ProcessPhotoParams({ format: ImageFormat.jpeg, fit: ImageFit.fill }),
    )
    expect(resultFromSync.length).toBeGreaterThan(0)
  }, 30000)

  it('should process sync correctly', async () => {
    await storageService.removeFile(destination).catch()

    await amqpService.publish(
      RabbitExchange.PhotoProcessor,
      RabbitRoutingKey.RequestProcess,
      ProcessPhoto.toBinary({
        source,
        destination,
        format: ImageFormatProto.JPEG,
        fit: ResizeFit.FILL,
      }),
    )

    let fileExist = false
    for (let attempts = 30; attempts && !fileExist; attempts--) {
      process.stdout.write('.')
      fileExist = await storageService.isExist(destination)
      await new Promise<void>((r) => setTimeout(() => r(), 1000))
    }
    expect(fileExist).toBe(true)
    resultFromAsync = await storageService.getBuffer(destination)
    await storageService.removeFile(destination).catch()
  }, 30000)

  afterAll(() => {
    expect(resultFromSync).toEqual(resultFromAsync)
    app.close()
  })
})
