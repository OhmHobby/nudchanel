import { Controller, Get, Header, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import etag from 'etag'
import { Request, Response } from 'express'
import { Span } from 'nestjs-otel'
import { StreamBufferConverter } from 'src/helpers/stream-buffer-converter'
import { StorageService } from 'src/storage/storage.service'
import { Exif } from '../models/exif.model'
import { FileDto } from './dto/base-file.dto'
import { GetProcessDto } from './dto/get-process.dto'
import { PhotoMetadataService } from './photo-metadata.service'
import { PhotoProcessorService } from './photo-processor.service'
import { ProcessPhotoParams } from './process-photo-params'

@Controller({ path: 'photo-processor' })
@ApiTags('PhotoProcessor')
export class PhotoProcessorController {
  constructor(
    private readonly storageService: StorageService,
    private readonly processorService: PhotoProcessorService,
    private readonly metadataService: PhotoMetadataService,
  ) {}

  @Get('md5')
  @ApiOkResponse()
  async getMd5(@Query() { path }: FileDto) {
    return await this.storageService.getFileMd5(path)
  }

  @Get('color')
  @ApiOkResponse()
  async getColor(@Query() { path }: FileDto) {
    const buffer = await this.storageService.getBuffer(path)
    return await this.metadataService.getPhotoColor(buffer)
  }

  @Get('exif')
  @ApiOkResponse({ type: Exif })
  async getExif(@Query() { path }: FileDto): Promise<Exif> {
    const buffer = await this.storageService.getBuffer(path)
    return await this.metadataService.getFileExif(buffer)
  }

  @Get('process')
  @Header('content-disposition', 'inline')
  @ApiHeader({ name: 'if-none-match' })
  @ApiOkResponse({
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  async process(
    @Req() request: Request,
    @Query()
    { path, format, width, height, quality, fit, watermark, widthRatio, heightRatio }: GetProcessDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | undefined> {
    const rawBuffer = await this.storageService.getBuffer(path)
    const buffer = await this.processorService.process(
      rawBuffer,
      new ProcessPhotoParams({ format, width, height, quality, fit, watermark, widthRatio, heightRatio }),
    )
    response.type('image/' + format)
    return this.streamBuffer(request, buffer, response)
  }

  @Span()
  private streamBuffer(request: Request, buffer: Buffer, response: Response) {
    const tag = etag(buffer)
    response.set({ ETag: tag })
    if (request.headers['if-none-match'] === tag) {
      response.status(HttpStatus.NOT_MODIFIED)
    } else {
      const stream = StreamBufferConverter.bufferToStream(buffer)
      return new StreamableFile(stream)
    }
  }
}
