import { Readable } from 'stream'

export interface StorageServiceInterface {
  getStream(file: string): Promise<Readable>

  getBuffer(file: string): Promise<Buffer>

  isExist(file: string): Promise<boolean>

  getSize(file: string): Promise<number>

  getEtag(file: string): Promise<string | null>

  putFile(file: string, data: Buffer | Readable): Promise<void>

  removeFile(file: string): Promise<void>
}
