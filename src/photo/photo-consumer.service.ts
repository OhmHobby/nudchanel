import { QueueOptions, RabbitRPC, defaultNackErrorHandler } from '@golevelup/nestjs-rabbitmq'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { FilePath } from '@nudchannel/protobuf/dist/file_path'
import { Timestamp } from '@nudchannel/protobuf/dist/google/protobuf/timestamp'
import { ImageFormat as ImageFormatProto } from '@nudchannel/protobuf/dist/image_format'
import { PhotoMetadata } from '@nudchannel/protobuf/dist/photo_metadata'
import { ProcessPhoto } from '@nudchannel/protobuf/dist/process_photo'
import { ResizeFit } from '@nudchannel/protobuf/dist/sharp_resize_fit'
import { ConsumeMessage } from 'amqplib'
import { Job } from 'bullmq'
import dayjs from 'dayjs'
import { AmqpService } from 'src/amqp/amqp.service'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { RabbitChannel } from 'src/enums/rabbit-channel.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'
import { RabbitQueue } from 'src/enums/rabbit-queue.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { StorageService } from 'src/storage/storage.service'
import { AsyncProcessPhotoParams } from './processor/async-process-photo-params'
import { PhotoMetadataService } from './processor/photo-metadata.service'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { ProcessPhotoParams } from './processor/process-photo-params'

const defaultQueueOptions: QueueOptions = {
  arguments: { 'x-queue-mode': 'lazy' },
  maxPriority: 10,
  durable: true,
  messageTtl: dayjs.duration({ hours: 8 }).asMilliseconds(),
}

@Injectable()
@Processor(BullQueueName.Photo)
export class PhotoConsumerService extends WorkerHost {
  private readonly logger = new Logger(PhotoConsumerService.name)

  constructor(
    private readonly storageService: StorageService,
    private readonly photoMetadataService: PhotoMetadataService,
    private readonly photoProcessorService: PhotoProcessorService,
    private readonly amqpService: AmqpService,
  ) {
    super()
  }

  async process({ data }: Job<AsyncProcessPhotoParams>) {
    this.logger.log({ message: `Process photo`, ...data })
    const rawBuffer = await this.storageService.getBuffer(data.source)
    const processedBuffer = await this.photoProcessorService.process(rawBuffer, new ProcessPhotoParams(data.params))
    await this.storageService.putFile(data.destination, processedBuffer)
  }

  @RabbitRPC({
    exchange: RabbitExchange.PhotoProcessor,
    routingKey: RabbitRoutingKey.GetMetadata + '.#',
    queue: RabbitQueue.PhotoMetadataQueue,
    allowNonJsonMessages: true,
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      ...defaultQueueOptions,
      deadLetterExchange: RabbitExchange.PhotoProcessorDlx,
      deadLetterRoutingKey: RabbitRoutingKey.GetMetadata,
    },
  })
  async getMetadata(_, { content, fields, properties }: ConsumeMessage) {
    const { path } = FilePath.fromBinary(content)
    const metadata = await this.getPhotoMetadata(path)
    this.logger.log({ message: 'Get metadata', ...metadata, messageTimestamp: properties.timestamp })
    await this.amqpService.publish(
      RabbitExchange.PhotoProcessor,
      fields.routingKey.replace(RabbitRoutingKey.GetMetadata, RabbitRoutingKey.Metadata),
      PhotoMetadata.toBinary(metadata),
    )
  }

  @RabbitRPC({
    exchange: RabbitExchange.PhotoProcessor,
    routingKey: RabbitRoutingKey.RequestProcess + '.#',
    queue: RabbitQueue.ProcessPhotoQueue,
    allowNonJsonMessages: true,
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      ...defaultQueueOptions,
      channel: RabbitChannel.Process,
      deadLetterExchange: RabbitExchange.PhotoProcessorDlx,
      deadLetterRoutingKey: RabbitRoutingKey.RequestProcess,
    },
  })
  async processPhoto(_, { content, fields, properties }: ConsumeMessage) {
    const { source, destination, ...payload } = ProcessPhoto.fromBinary(content)
    const rawBuffer = await this.storageService.getBuffer(source)
    const processedBuffer = await this.photoProcessorService.process(
      rawBuffer,
      new ProcessPhotoParams({
        format: ImageFormat[ImageFormatProto[payload.format].toLowerCase()],
        width: payload.width,
        height: payload.height,
        quality: payload.quality,
        fit: payload.fit && ImageFit[ResizeFit[payload.fit].toLowerCase()],
        watermark: payload.watermark,
      }),
    )
    await this.storageService.putFile(destination, processedBuffer)
    this.logger.log({ message: 'Processed', source, destination, messageTimestamp: properties.timestamp })
    await this.amqpService.publish(
      RabbitExchange.PhotoProcessor,
      fields.routingKey.replace(RabbitRoutingKey.RequestProcess, RabbitRoutingKey.Processed),
      content,
    )
  }

  private async getPhotoMetadata(path: string): Promise<PhotoMetadata> {
    const [md5, [exif, color]] = await Promise.all([
      this.storageService.getFileMd5(path),
      this.storageService
        .getBuffer(path)
        .then((buffer) =>
          Promise.all([this.photoMetadataService.getFileExif(buffer), this.photoMetadataService.getPhotoColor(buffer)]),
        ),
    ])
    return PhotoMetadata.create({
      path,
      md5,
      width: exif.width,
      height: exif.height,
      orientation: exif.orientation,
      timestamp: Timestamp.fromDate(exif.date),
      color: color,
    })
  }
}
