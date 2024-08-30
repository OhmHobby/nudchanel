import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import dayjs from 'dayjs'
import dayjsDuration from 'dayjs/plugin/duration'
import etag from 'etag'
import { Response } from 'express'
import { Span } from 'nestjs-otel'
import { Config } from 'src/enums/config.enum'
import { StreamBufferConverter } from 'src/helpers/stream-buffer-converter'
import { StorageService } from 'src/storage/storage.service'
import { Readable } from 'stream'
import { PhotoPath } from '../models/photo-path.model'
import { PhotoProcessorService } from '../processor/photo-processor.service'
import { ProfilePhotoPath } from '../models/profile-photo-path.model'
dayjs.extend(dayjsDuration)

@Injectable()
export class PhotoStreamService {
  private readonly logger = new Logger(PhotoStreamService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly photoProcessor: PhotoProcessorService,
  ) {}

  async getPhotoStream(
    response: Response,
    originalPath: PhotoPath,
    requestEtag?: string,
  ): Promise<Readable | undefined> {
    if (originalPath.isRequestASource) {
      const currentEtag = await this.storageService.getEtag(originalPath.requestPath)
      const isNotModified = this.isNotModified(response, requestEtag, currentEtag)
      if (isNotModified) return undefined

      const sourceStream = await this.tryStream(originalPath.requestPath)
      if (sourceStream) return this.responseWithStream(response, sourceStream, requestEtag, currentEtag)
    }

    for (
      let currentPath: PhotoPath | undefined = originalPath.nextFallback();
      currentPath;
      currentPath = currentPath?.nextFallback()
    ) {
      const buffer = await this.tryProcess(currentPath, originalPath)
      if (buffer) return this.responseWithBuffer(response, buffer, requestEtag)
    }
    throw new NotFoundException()
  }

  async getPhotoProfileStream(
    response: Response,
    originalPath: ProfilePhotoPath,
    requestEtag?: string,
  ): Promise<Readable | undefined> {
    const currentEtag = await this.storageService.getEtag(originalPath.path)
    const isNotModified = this.isNotModified(response, requestEtag, currentEtag)
    if (isNotModified) return undefined

    const sourceStream = await this.tryStream(originalPath.path)
    if (sourceStream) return this.responseWithStream(response, sourceStream, requestEtag, currentEtag)
    throw new NotFoundException()
  }

  isNotModified(response: Response, requestEtag?: string | null, responseEtag?: string | null) {
    const isNotModified = responseEtag && requestEtag === responseEtag
    response.set({ ETag: responseEtag })
    if (isNotModified) response.status(HttpStatus.NOT_MODIFIED)
    return isNotModified
  }

  @Span()
  async responseWithStream(
    response: Response,
    stream: Readable,
    requestEtag?: string | null,
    responseEtag?: string | null,
  ) {
    if (!responseEtag) {
      const buffer = await StreamBufferConverter.streamToBuffer(stream)
      responseEtag = etag(buffer)
      stream = StreamBufferConverter.bufferToStream(buffer)
    }
    const isNotModified = this.isNotModified(response, requestEtag, responseEtag)
    if (isNotModified) return undefined
    return stream
  }

  @Span()
  responseWithBuffer(response: Response, buffer: Buffer, requestEtag?: string | null, responseEtag?: string | null) {
    if (!responseEtag) responseEtag = etag(buffer)
    const isNotModified = this.isNotModified(response, requestEtag, responseEtag)
    if (isNotModified) return undefined
    return StreamBufferConverter.bufferToStream(buffer)
  }

  @Span()
  async tryStream(sourcePath: string) {
    try {
      const sourceStream = await this.storageService.getStream(sourcePath)
      return sourceStream
    } catch (err) {
      return null
    }
  }

  @Span()
  async tryProcess(processPath: PhotoPath, targetPath: PhotoPath) {
    try {
      this.logger.debug(`Try process "${targetPath.requestPath}" from "${processPath.sourcePath}"`)
      const sourceBuffer = await this.storageService.getBuffer(processPath.sourcePath)
      const processedBuffer = await this.photoProcessor.process(sourceBuffer, targetPath.processParams)
      this.saveProcssedBuffer(targetPath, processedBuffer)
      return processedBuffer
    } catch (err) {
      return null
    }
  }

  @Span()
  async saveProcssedBuffer(photoPath: PhotoPath, processedBuffer: Buffer) {
    if (photoPath.isRequestASource && this.configService.get<boolean>(Config.PHOTO_STREAM_UPLOAD)) {
      await this.storageService.putFile(photoPath.sourcePath, processedBuffer)
    }
  }

  setCacheHeaders(response: Response) {
    const maxAge = this.configService.getOrThrow<number>(Config.PHOTO_STREAM_CACHE_MAX_AGE)
    const sMaxAge = this.configService.getOrThrow<number>(Config.PHOTO_STREAM_CACHE_S_MAXAGE)
    const staileWhileRevalidate = this.configService.getOrThrow<number>(
      Config.PHOTO_STREAM_CACHE_STALE_WHILE_REVALIDATE,
    )
    response.setHeader(
      'Cache-Control',
      `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staileWhileRevalidate}`,
    )
  }
}
