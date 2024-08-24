import { Test, TestingModule } from '@nestjs/testing'
import { ImageFormat as ImageFormatProto } from '@nudchannel/protobuf/dist/image_format'
import { ProcessPhoto } from '@nudchannel/protobuf/dist/process_photo'
import { ResizeFit } from '@nudchannel/protobuf/dist/sharp_resize_fit'
import { AmqpService } from 'src/amqp/amqp.service'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { RabbitRoutingKey } from 'src/enums/rabbit-routing-key.enum'
import { StorageService } from 'src/storage/storage.service'
import { TestData } from 'test/test-data'
import { PhotoConsumerService } from './photo-consumer.service'
import { PhotoMetadataService } from './processor/photo-metadata.service'
import { PhotoProcessorService } from './processor/photo-processor.service'
import { ProcessPhotoParams } from './processor/process-photo-params'

jest.mock('src/amqp/amqp.service')
jest.mock('src/storage/storage.service')
jest.mock('./processor/photo-metadata.service')
jest.mock('./processor/photo-processor.service')

describe(PhotoConsumerService.name, () => {
  let consumer: PhotoConsumerService
  let storageService: StorageService
  let processorService: PhotoProcessorService
  let amqpService: AmqpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoConsumerService, StorageService, PhotoMetadataService, PhotoProcessorService, AmqpService],
    }).compile()

    consumer = module.get(PhotoConsumerService)
    storageService = module.get(StorageService)
    processorService = module.get(PhotoProcessorService)
    amqpService = module.get(AmqpService)
  })

  describe(PhotoConsumerService.prototype.processPhoto.name, () => {
    it('should call process correctly', async () => {
      const destination = '/webdev/test.webp'
      const format = ImageFormatProto.WEBP
      const source = '/2023/test.jpg'
      const fit = ResizeFit.OUTSIDE
      const width = 1920
      const height = 1080
      const quality = 80
      const watermark = '01'
      const content = ProcessPhoto.toBinary({
        destination,
        format,
        source,
        fit,
        width,
        height,
        quality,
        watermark,
      })
      const message = TestData.aValidConsumeMessage()
        .withContent(content)
        .withRoutingKey(`${RabbitRoutingKey.RequestProcess}.test`)
        .build()
      await consumer.processPhoto(null, message)
      expect(storageService.getBuffer).toHaveBeenCalledWith(source)
      expect(processorService.process).toHaveBeenCalledWith(
        undefined,
        new ProcessPhotoParams({
          format: ImageFormat.webp,
          width: width,
          height: height,
          quality: quality,
          fit: ImageFit.outside,
          watermark: watermark,
        }),
      )
      expect(amqpService.publish).toHaveBeenCalledWith(
        expect.any(String),
        `${RabbitRoutingKey.Processed}.test`,
        expect.anything(),
      )
    })
  })
})
