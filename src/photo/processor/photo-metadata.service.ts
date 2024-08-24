import { Injectable, Logger } from '@nestjs/common'
import exifParser from 'exif-parser'
import { getAverageColor } from 'fast-average-color-node'
import getColors from 'get-image-colors'
import { Span } from 'nestjs-otel'
import { ImageFormat } from 'src/enums/image-format.enum'
import { Exif } from '../models/exif.model'
import { PhotoProcessorService } from './photo-processor.service'
import { ProcessPhotoParams } from './process-photo-params'

@Injectable()
export class PhotoMetadataService {
  private readonly logger = new Logger(PhotoMetadataService.name)

  constructor(private readonly photoProcessor: PhotoProcessorService) {}

  @Span()
  getFileExif(buffer: Buffer): Exif {
    const raw = exifParser.create(buffer).parse()
    this.logger.log({ message: 'Exif parsed', raw })
    const { imageSize, tags } = raw
    const dates = [tags.CreateDate, tags.DateTimeOriginal].map((el) => +el).filter((el) => !Number.isNaN(el))
    return new Exif(imageSize.width, imageSize.height, tags.Orientation, Math.min(...dates), tags.undefined)
  }

  @Span()
  async getPhotoColor(file: Buffer) {
    const buffer = await this.photoProcessor.process(
      file,
      new ProcessPhotoParams({ format: ImageFormat.jpeg, width: 200 }),
    )
    this.logger.debug({ message: 'Getting color' })
    return (await this.getDominantColorHex(buffer)) ?? (await this.getAverageColorHex(buffer)) ?? '#ffffff'
  }

  @Span()
  async getDominantColorHex(buffer: Buffer) {
    try {
      const colors = await getColors(buffer, 'image/jpeg')
      const hex = colors[0].hex()
      this.logger.log({ color: hex, mode: 'dominant' })
      return hex
    } catch (err) {
      this.logger.warn(err.message)
      return null
    }
  }

  @Span()
  async getAverageColorHex(buffer: Buffer) {
    try {
      const color = await getAverageColor(buffer)
      this.logger.log({ color: color.hex, mode: 'average' })
      return color.hex
    } catch (err) {
      this.logger.warn(err.message)
      return null
    }
  }
}
