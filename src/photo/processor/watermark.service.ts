import { Injectable, Logger } from '@nestjs/common'
import { readFile } from 'fs/promises'
import Jimp from 'jimp'
import JPEG from 'jpeg-js'
import { Span, TraceService } from 'nestjs-otel'
import { resolve } from 'path'

Jimp.decoders['image/jpeg'] = (data) =>
  JPEG.decode(data, {
    maxMemoryUsageInMB: 4096,
  })

import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { WatermarkPosition } from 'src/enums/watermark-position.enum'
import { WatermarkConfig } from './watermark-config'

@Injectable()
export class PhotoWatermarkService {
  private readonly logger = new Logger(PhotoWatermarkService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly traceService: TraceService,
  ) {}

  getWatermarkPreset(preset?: string): WatermarkConfig | undefined {
    const configKey = `${Config.PHOTO_PROCESSOR_WATERMARK}.${preset}`
    const watermarkConfig = this.configService.get<WatermarkConfig>(configKey)
    if (!watermarkConfig) this.logger.warn({ message: `Unrecognized watermark`, preset, configKey })
    return watermarkConfig
  }

  @Span()
  async loadWatermarkBuffer(file: string) {
    return await readFile(resolve(file))
  }

  @Span()
  async insertWatermark(photoBuffer: Buffer, preset?: string) {
    if (!preset) return photoBuffer
    const watermark = this.getWatermarkPreset(preset)
    if (!watermark) return photoBuffer
    const watermarkBuffer = await this.loadWatermarkBuffer(watermark.file)
    if (watermark.position === WatermarkPosition.BottomLeft) {
      return this.insertBottomLeft(photoBuffer, watermarkBuffer, watermark)
    }
  }

  @Span()
  async insertBottomLeft(photoBuffer: Buffer, watermarkBuffer: Buffer, config: WatermarkConfig) {
    const sizePercentage = config.size
    const marginX = config.marginX
    const marginY = config.marginY
    const opacity = config.opacity
    const jimpReadSpan = this.traceService.startSpan('Jimp.read')
    const [photo, watermark] = await Promise.all([Jimp.read(photoBuffer), Jimp.read(watermarkBuffer)])
    jimpReadSpan.end()
    const photoResolution = photo.bitmap.width * photo.bitmap.height
    const watermarkRatio = watermark.bitmap.width / watermark.bitmap.height
    const watermarkTargetWidth = Math.sqrt(sizePercentage * photoResolution * watermarkRatio)
    watermark.resize(watermarkTargetWidth, Jimp.AUTO)
    watermark.opacity(opacity)
    const watermarkPositionX = photo.bitmap.width - watermark.bitmap.width - photo.bitmap.width * marginX
    const watermarkPositionY = photo.bitmap.height - watermark.bitmap.height - photo.bitmap.height * marginY
    const jimpCompositeSpan = this.traceService.startSpan('Jimp.composite')
    const withWatermark = await photo
      .composite(watermark, watermarkPositionX, watermarkPositionY)
      .getBufferAsync(Jimp.MIME_JPEG)
    jimpCompositeSpan.end()
    return withWatermark
  }
}
