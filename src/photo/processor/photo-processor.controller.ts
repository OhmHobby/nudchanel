import { Controller, Get, Header, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import etag from 'etag'
import { Request, Response } from 'express'
import { Span } from 'nestjs-otel'
import { StreamBufferConverter } from 'src/helpers/stream-buffer-converter'
import { StorageService } from 'src/storage/storage.service'
import { GetProcessDto } from './dto/get-process.dto'
import { PhotoProcessorService } from './photo-processor.service'
import { ProcessPhotoParams } from './process-photo-params'

@Controller({ path: 'photo-processor' })
@ApiTags('PhotoProcessor')
export class PhotoProcessorController {
  constructor(
    private readonly storageService: StorageService,
    private readonly processorService: PhotoProcessorService,
  ) {}

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
    { path, format, width, height, quality, fit, watermark }: GetProcessDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | undefined> {
    const rawBuffer = await this.storageService.getBuffer(path)
    const buffer = await this.processorService.process(
      rawBuffer,
      new ProcessPhotoParams({ format, width, height, quality, fit, watermark }),
    )
    response.type('image/' + format)
    return await this.streamBuffer(request, buffer, response)
  }

  @Span()
  private async streamBuffer(request: Request, buffer: Buffer, response: Response) {
    const tag = await etag(buffer)
    response.set({ ETag: tag })
    if (request.headers['if-none-match'] === tag) {
      response.status(HttpStatus.NOT_MODIFIED)
    } else {
      const stream = StreamBufferConverter.bufferToStream(buffer)
      return new StreamableFile(stream)
    }
  }
}
