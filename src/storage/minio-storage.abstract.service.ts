import { Client, ClientOptions } from 'minio'
import { StreamBufferConverter } from 'src/helpers/stream-buffer-converter'
import { Readable } from 'stream'
import { StorageServiceInterface } from './storage-service.interface'

export abstract class MinioStorageAbstractService implements StorageServiceInterface {
  protected _client: Client

  constructor(
    private readonly clientOption: ClientOptions,
    private readonly bucketName: string,
  ) {}

  protected get client(): Client {
    if (!this._client) {
      this._client = new Client(this.clientOption)
    }
    return this._client
  }

  getStream(file: string): Promise<Readable> {
    return this.client.getObject(this.bucketName, file)
  }

  getBuffer(file: string): Promise<Buffer> {
    return this.getStream(file).then(StreamBufferConverter.streamToBuffer.bind(this))
  }

  async isExist(file: string): Promise<boolean> {
    try {
      await this.getSize(file)
      return true
    } catch (err) {
      if (err.code === 'NotFound') {
        return false
      } else {
        throw err
      }
    }
  }

  async getSize(file: string): Promise<number> {
    const { size } = await this.client.statObject(this.bucketName, file)
    return size
  }

  async getEtag(file: string): Promise<string | null> {
    try {
      const { etag } = await this.client.statObject(this.bucketName, file)
      return etag || null
    } catch (err) {
      return null
    }
  }

  async putFile(file: string, data: Buffer | Readable): Promise<void> {
    await this.client.putObject(this.bucketName, file, data)
  }

  async removeFile(file: string): Promise<void> {
    await this.client.removeObject(this.bucketName, file)
  }
}
