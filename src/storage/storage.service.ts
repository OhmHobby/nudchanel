import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { StorageBackend } from 'src/enums/storage-backend.enum'
import { MD5 } from 'src/helpers/md5.helper'
import { Readable } from 'stream'
import { PhotoMinioStorageService } from './photo-minio-storage.service'
import { StorageServiceInterface } from './storage-service.interface'
import { WebdavStorageService } from './webdav-storage.service'

@Injectable()
export class StorageService implements StorageServiceInterface {
  constructor(
    private readonly webdavStorageService: WebdavStorageService,
    private readonly minioStorageService: PhotoMinioStorageService,
  ) {}

  getStorage(file: string): StorageServiceInterface {
    switch (file.split('://').at(0)) {
      case StorageBackend.minio:
        return this.minioStorageService
      case StorageBackend.webdav:
      case file:
        return this.webdavStorageService
      default:
        throw new Error('INVALID_BACKEND_STORAGE')
    }
  }

  getFilepath(file: string): string {
    return (file.split('://').at(1) ?? file).replace(/^\/*/, '/')
  }

  @Span()
  async getStream(file: string): Promise<Readable> {
    await this.throwIfFileDoesNotExist(file)
    return this.getStorage(file).getStream(this.getFilepath(file))
  }

  @Span()
  async getBuffer(file: string): Promise<Buffer> {
    await this.throwIfFileDoesNotExist(file)
    return this.getStorage(file).getBuffer(this.getFilepath(file))
  }

  listFiles(path: string): Promise<string[]> {
    return this.getStorage(path).listFiles(this.getFilepath(path))
  }

  isExist(file: string): Promise<boolean> {
    return this.getStorage(file).isExist(this.getFilepath(file))
  }

  @Span()
  getSize(file: string): Promise<number> {
    return this.getStorage(file).getSize(this.getFilepath(file))
  }

  @Span()
  getEtag(file: string): Promise<string | null> {
    return this.getStorage(file).getEtag(this.getFilepath(file))
  }

  @Span()
  putFile(file: string, data: Buffer | Readable): Promise<void> {
    return this.getStorage(file).putFile(this.getFilepath(file), data)
  }

  async copyFile(source: string, destination: string): Promise<void> {
    const stream = await this.getStream(source)
    return this.putFile(destination, stream)
  }

  removeFile(file: string): Promise<void> {
    return this.getStorage(file).removeFile(this.getFilepath(file))
  }

  @Span()
  async throwIfFileDoesNotExist(file: string) {
    try {
      const fileSize = await this.getSize(file)
      if (fileSize === 0) throw new BadRequestException(null, 'No data')
    } catch (err) {
      if (err.status === HttpStatus.NOT_FOUND || err.code === 'NotFound') {
        throw new NotFoundException(null, err.message)
      } else if (err.status === HttpStatus.BAD_REQUEST || err.message === 'INVALID_BACKEND_STORAGE') {
        throw new BadRequestException(null, err.message)
      } else {
        throw new InternalServerErrorException(err.message)
      }
    }
  }

  @Span()
  async getFileMd5(file: string): Promise<string> {
    const stream = await this.getStream(file)
    const md5 = await MD5.fromStream(stream)
    return md5.hex
  }
}
