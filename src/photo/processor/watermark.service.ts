import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFile } from 'fs/promises'
import { Span, TraceService } from 'nestjs-otel'
import { resolve } from 'path'
import sharp from 'sharp'
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
  async insertWatermark(photo: sharp.Sharp, preset?: string) {
    if (!preset) return photo
    const watermarkConfig = this.getWatermarkPreset(preset)
    if (!watermarkConfig) return photo
    const watermarkBuffer = await this.loadWatermarkBuffer(watermarkConfig.file)
    if (watermarkConfig.position === WatermarkPosition.BottomLeft) {
      return this.insertBottomLeft(photo, sharp(watermarkBuffer), watermarkConfig)
    }
    return photo
  }

  @Span()
  async insertBottomLeft(photo: sharp.Sharp, watermark: sharp.Sharp, config: WatermarkConfig) {
    const sizePercentage = config.size
    const marginX = config.marginX
    const marginY = config.marginY
    photo = sharp(await photo.toBuffer())
    const [photoMeta, watermarkMeta] = await Promise.all([photo.metadata(), watermark.metadata()])
    const photoResolution = photoMeta.width! * photoMeta.height!
    const watermarkRatio = watermarkMeta.width! / watermarkMeta.height!
    const watermarkTargetWidth = Math.sqrt(sizePercentage * photoResolution * watermarkRatio)
    const watermarkTargetHeight = watermarkTargetWidth / watermarkRatio
    const watermarkPositionX = photoMeta.width! - watermarkTargetWidth - photoMeta.width! * marginX
    const watermarkPositionY = photoMeta.height! - watermarkTargetHeight - photoMeta.height! * marginY
    const watermarkBuffer = await watermark.resize({ width: Math.floor(watermarkTargetWidth) }).toBuffer()
    return photo.composite([
      {
        input: watermarkBuffer,
        left: Math.floor(watermarkPositionX),
        top: Math.floor(watermarkPositionY),
      },
    ])
  }
}
