import { Injectable, Logger } from '@nestjs/common'
import etag from 'etag'
import { Span, TraceService } from 'nestjs-otel'
import sharp from 'sharp'
import { ImageFormat } from 'src/enums/image-format.enum'
import { ProcessPhotoParams } from './process-photo-params'
import { PhotoWatermarkService } from './watermark.service'

@Injectable()
export class PhotoProcessorService {
  private readonly logger = new Logger(PhotoProcessorService.name)

  constructor(
    private readonly traceService: TraceService,
    private readonly watermarkService: PhotoWatermarkService,
  ) {}

  @Span()
  async insertWatermark(original: sharp.Sharp, quality?: number, watermarkPreset?: string) {
    const span = this.traceService.startSpan('preWatermarkJpeg')
    const originalBuffer = await original.jpeg({ quality }).toBuffer()
    span.end()
    try {
      const result = await this.watermarkService.insertWatermark(originalBuffer, watermarkPreset)
      return sharp(result)
    } catch (err) {
      this.logger.error(`Failed to insert watermark`, err)
      return original
    }
  }

  @Span()
  async process(fileBuffer: Buffer, params: ProcessPhotoParams): Promise<Buffer> {
    const { format, width, height, quality, fit, watermark } = params
    this.logger.log({ message: 'Processing', format, width, height, fit, quality, watermark, etag: etag(fileBuffer) })
    let photo: sharp.Sharp = sharp(fileBuffer).rotate()

    if (width || height) photo.resize({ width, height, fit, withoutEnlargement: true })

    if (watermark) photo = await this.insertWatermark(photo, quality, watermark)

    if (format === ImageFormat.webp) photo.webp({ quality })
    else photo.jpeg({ quality })

    return photo.toBuffer()
  }
}
