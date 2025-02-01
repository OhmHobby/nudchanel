import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { dirname } from 'path'
import { Config } from 'src/enums/config.enum'
import { Readable } from 'stream'
import { AuthType, createClient, FileStat, WebDAVClient } from 'webdav'
import { StorageServiceInterface } from './storage-service.interface'

@Injectable()
export class WebdavStorageService implements StorageServiceInterface {
  private _client: WebDAVClient

  constructor(private readonly configService: ConfigService) {}

  private get client(): WebDAVClient {
    if (!this._client) {
      this._client = createClient(this.configService.getOrThrow(Config.STORAGE_WEBDAV_URL), {
        authType: this.configService.get<AuthType>(Config.STORAGE_WEBDAV_AUTHTYPE),
        username: this.configService.get(Config.STORAGE_WEBDAV_USERNAME),
        password: this.configService.get(Config.STORAGE_WEBDAV_PASSWORD),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      })
    }
    return this._client
  }

  getStream(file: string): Promise<Readable> {
    return Promise.resolve(this.client.createReadStream(file))
  }

  getBuffer(file: string): Promise<Buffer> {
    return <Promise<Buffer>>this.client.getFileContents(file)
  }

  async listFiles(path: string): Promise<string[]> {
    const files = <FileStat[]>await this.client.getDirectoryContents(path)
    return files.map((el) => el.filename)
  }

  isExist(file: string): Promise<boolean> {
    return this.client.exists(file)
  }

  async getSize(file: string): Promise<number> {
    const { type, size } = <FileStat>await this.client.stat(file)
    if (type === 'directory') throw new NotFoundException()
    return size
  }

  async getEtag(file: string): Promise<string | null> {
    try {
      const { etag } = <FileStat>await this.client.stat(file)
      return etag || null
    } catch (err) {
      return null
    }
  }

  async putFile(file: string, data: Buffer | Readable): Promise<void> {
    await this.createDirectoryFromFullpathFilename(file)
    await this.client.putFileContents(file, data)
  }

  async removeFile(file: string): Promise<void> {
    await this.client.deleteFile(file)
  }

  async createDirectoryFromFullpathFilename(filename: string) {
    const directory = dirname(filename)
    const isExist = await this.client.exists(directory)
    if (!isExist) await this.client.createDirectory(directory, { recursive: true })
    return !isExist
  }
}
